import { NextRequest, NextResponse } from 'next/server';

// ============ 配置参数 ============
// 自定义问题限制：每人可提问次数（预设问题不计入）
const MAX_CUSTOM_QUESTIONS = 5;  // 降低到5次，节省成本

// 全局金额限制：单位元，达到后关闭服务
const GLOBAL_BUDGET_LIMIT = 5;  // 降低到5元，快速止损

// 单次调用最大 token 数
const MAX_TOKENS_PER_REQUEST = 300;  // 从500降低到300，减少单次成本

// Token 单价估算（abab6.5s-chat）
const COST_PER_1K_TOKENS = 0.002;
const AVG_TOKENS_PER_CALL = 700; // 预估平均消耗
const COST_PER_CALL_ESTIMATE = (AVG_TOKENS_PER_CALL / 1000) * COST_PER_1K_TOKENS;

// 截止日期后自动关闭
const DEADLINE = new Date('2026-02-15T23:59:59+08:00').getTime();

// ============ 服务控制 ============
// 环境变量控制：设置 SERVICE_CLOSED=true 可立即关闭服务
const SERVICE_CLOSED = process.env.SERVICE_CLOSED === 'true';

// ============ 内存存储 ============
interface IPRecord {
  count: number;
  firstVisit: number;
}

const ipUsageMap = new Map<string, IPRecord>();
let globalSpent = 0;
let globalRequestCount = 0;
let isServiceClosed = false;

// ============ 辅助函数 ============
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function formatMoney(yuan: number): string {
  return `¥${yuan.toFixed(2)}`;
}

function getRemainingBudget(): number {
  return Math.max(0, GLOBAL_BUDGET_LIMIT - globalSpent);
}

// ============ API 路由 ============

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();

  // 0. 检查手动关闭开关（优先级最高）
  if (SERVICE_CLOSED) {
    return NextResponse.json({
      choices: [{
        message: {
          content: '🔒 AI 对话功能已暂时关闭。作业展示结束后，感谢大家体验 InsightFlow！'
        }
      }]
    });
  }

  // 1. 检查截止日期
  if (now > DEADLINE) {
    return NextResponse.json({
      choices: [{
        message: {
          content: '🔒 AI 对话功能已自动关闭（作业评审期已结束）。感谢访问 InsightFlow 展示页！'
        }
      }]
    });
  }
  
  // 2. 检查全局金额限制
  if (isServiceClosed || globalSpent >= GLOBAL_BUDGET_LIMIT) {
    isServiceClosed = true;
    return NextResponse.json({
      choices: [{
        message: {
          content: `🔒 演示预算已用完（${formatMoney(globalSpent)}/${formatMoney(GLOBAL_BUDGET_LIMIT)}）。感谢理解！`
        }
      }]
    });
  }
  
  // 3. 检查个人次数限制
  const ipRecord = ipUsageMap.get(ip);
  
  if (ipRecord && ipRecord.count >= MAX_CUSTOM_QUESTIONS) {
    return NextResponse.json({
      choices: [{
        message: {
          content: `🎯 您的自定义提问次数已用完（每人限 ${MAX_CUSTOM_QUESTIONS} 次）。\n\n这是为了保证更多访客能体验到通爻的功能。欢迎点击上方的预设问题继续探索！`
        }
      }]
    }, { status: 429 });
  }
  
  try {
    const { messages } = await req.json();
    const apiKey = process.env.MINIMAX_API_KEY || '';

    // ============ 调试日志 ============
    console.log('=== API 调用调试信息 ===');
    console.log('1. API Key 状态:', apiKey ? '存在' : '不存在');
    console.log('2. API Key 长度:', apiKey.length);
    console.log('3. API Key 前缀:', apiKey.substring(0, 10) + '...');
    console.log('4. API Key 后缀:', '...' + apiKey.substring(apiKey.length - 10));
    console.log('5. 是否包含空格:', apiKey.includes(' ') || apiKey.includes('\n') || apiKey.includes('\t'));
    console.log('=======================');

    if (!apiKey) {
      return NextResponse.json({
        choices: [{
          message: {
            content: '⚠️ API Key 未配置'
          }
        }]
      }, { status: 500 });
    }
    
    const response = await fetch('https://api.minimaxi.com/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'M2-her',  // 使用 M2 模型（Coding Plan 支持）
        messages: messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS_PER_REQUEST
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== MiniMax API 错误响应 ===');
      console.error('状态码:', response.status);
      console.error('错误详情:', errorText);
      console.error('============================');
      return NextResponse.json({
        choices: [{
          message: {
            content: '抱歉，AI 服务暂时不可用，请稍后再试。'
          }
        }]
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('=== MiniMax API 成功响应 ===');
    console.log('响应数据:', JSON.stringify(data, null, 2));
    console.log('=============================');

    // 检查 MiniMax API 特定的错误代码
    if (data.base_resp && data.base_resp.status_code !== 0) {
      console.error('=== MiniMax 业务逻辑错误 ===');
      console.error('错误代码:', data.base_resp.status_code);
      console.error('错误信息:', data.base_resp.status_msg);
      console.error('============================');

      // 针对不同错误代码返回友好提示
      const errorMessages: Record<number, string> = {
        2049: '🔑 API Key 无效或已过期。请在 Vercel 环境变量中检查 MINIMAX_API_KEY',
        1000: '服务器内部错误',
        1001: '参数错误',
        1002: '请求频率过高',
      };

      const errorMsg = errorMessages[data.base_resp.status_code] || `API 错误: ${data.base_resp.status_msg}`;

      return NextResponse.json({
        choices: [{
          message: {
            content: errorMsg
          }
        }]
      }, { status: 400 });
    }
    
    // 更新统计
    const actualTokens = data.usage?.total_tokens || AVG_TOKENS_PER_CALL;
    const actualCost = (actualTokens / 1000) * COST_PER_1K_TOKENS;
    
    globalSpent += actualCost;
    globalRequestCount++;
    
    if (ipRecord) {
      ipRecord.count++;
    } else {
      ipUsageMap.set(ip, { count: 1, firstVisit: now });
    }
    
    if (globalSpent >= GLOBAL_BUDGET_LIMIT) {
      isServiceClosed = true;
    }
    
    const remainingForThisIP = MAX_CUSTOM_QUESTIONS - (ipRecord?.count || 0) - 1;
    const remainingBudget = getRemainingBudget();
    
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', String(Math.max(0, remainingForThisIP)));
    headers.set('X-Global-Budget-Remaining', formatMoney(remainingBudget));
    
    return NextResponse.json(data, { headers });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      choices: [{
        message: {
          content: '抱歉，服务器出错了，请稍后再试。'
        }
      }]
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const ipRecord = ipUsageMap.get(ip);
  const remainingBudget = getRemainingBudget();

  return NextResponse.json({
    // 服务状态
    service: {
      closed: SERVICE_CLOSED || isServiceClosed || globalSpent >= GLOBAL_BUDGET_LIMIT,
      manuallyClosed: SERVICE_CLOSED,
      deadline: new Date(DEADLINE).toISOString(),
      isExpired: Date.now() > DEADLINE
    },
    // 费用统计
    cost: {
      spent: formatMoney(globalSpent),
      budget: formatMoney(GLOBAL_BUDGET_LIMIT),
      remaining: formatMoney(remainingBudget),
      percentUsed: Math.min(100, (globalSpent / GLOBAL_BUDGET_LIMIT) * 100).toFixed(1)
    },
    // 个人使用
    personal: {
      used: ipRecord?.count || 0,
      limit: MAX_CUSTOM_QUESTIONS,
      remaining: Math.max(0, MAX_CUSTOM_QUESTIONS - (ipRecord?.count || 0))
    },
    // 说明
    instructions: {
      howToClose: "在 Vercel 环境变量中设置 SERVICE_CLOSED=true 即可关闭服务",
      howToCheck: "访问 /api/chat 查看详细状态"
    }
  });
}
