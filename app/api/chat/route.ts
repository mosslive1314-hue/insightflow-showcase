import { NextRequest, NextResponse } from 'next/server';

// ============ 配置参数 ============
// 个人限制：每人总共可提问次数（终身，不是按时间窗口）
const MAX_QUESTIONS_PER_PERSON = 5;

// 全局金额限制：单位元，达到后关闭服务
const GLOBAL_BUDGET_LIMIT = 30; // 30元后自动关闭

// 单次调用最大 token 数（控制成本）
const MAX_TOKENS_PER_REQUEST = 400;

// Token 单价估算（abab6.5s-chat）：输出约 0.002元/1K tokens
const COST_PER_1K_TOKENS = 0.002;
const AVG_TOKENS_PER_CALL = 600; // 预估平均消耗（输入+输出）
const COST_PER_CALL_ESTIMATE = (AVG_TOKENS_PER_CALL / 1000) * COST_PER_1K_TOKENS;

// 截止日期后自动关闭（额外保险）
const DEADLINE = new Date('2026-02-15T23:59:59+08:00').getTime();

// ============ 内存存储 ============
// 注意：Vercel 是无状态环境，服务器重启后数据会重置
// 但对于作业展示场景，这种简化方案够用

interface IPRecord {
  count: number;      // 已使用次数
  firstVisit: number; // 首次访问时间
}

const ipUsageMap = new Map<string, IPRecord>();
let globalSpent = 0; // 已花费金额（元）
let globalRequestCount = 0; // 总请求次数
let isServiceClosed = false; // 服务是否已关闭

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

function getStatusMessage(): string {
  const remainingBudget = getRemainingBudget();
  const remainingPercent = (remainingBudget / GLOBAL_BUDGET_LIMIT) * 100;
  
  if (remainingPercent > 50) return '🟢 服务正常';
  if (remainingPercent > 20) return '🟡 额度中等';
  if (remainingPercent > 5) return '🟠 额度紧张';
  return '🔴 额度即将耗尽';
}

// ============ API 路由 ============

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const now = Date.now();
  
  // 1. 检查是否已过截止日期
  if (now > DEADLINE) {
    return NextResponse.json({
      choices: [{
        message: {
          content: '🔒 AI 对话功能已自动关闭（作业评审期已结束）。感谢访问 InsightFlow 展示页！如需了解更多，请联系作者。'
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
          content: `🔒 AI 对话功能已暂停：演示预算已用完（已使用 ${formatMoney(globalSpent)} / ${formatMoney(GLOBAL_BUDGET_LIMIT)}）。感谢理解！这是为了防止 API 额度被滥用而设置的自动保护机制。`
        }
      }]
    });
  }
  
  // 3. 检查个人次数限制
  const ipRecord = ipUsageMap.get(ip);
  
  if (ipRecord && ipRecord.count >= MAX_QUESTIONS_PER_PERSON) {
    return NextResponse.json({
      choices: [{
        message: {
          content: `🎯 您的提问次数已用完（每人限 ${MAX_QUESTIONS_PER_PERSON} 个问题）。\n\n这是为了保证更多访客能体验到通爻的功能。如果您还想继续交流，欢迎联系作者私下探讨！`
        }
      }]
    }, { status: 429 });
  }
  
  try {
    const { messages } = await req.json();
    const apiKey = process.env.MINIMAX_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({
        choices: [{
          message: {
            content: '⚠️ API Key 未配置，请联系管理员。'
          }
        }]
      }, { status: 500 });
    }
    
    // 调用 MiniMax API
    const response = await fetch('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: MAX_TOKENS_PER_REQUEST
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API Error:', response.status, errorText);
      return NextResponse.json({
        choices: [{
          message: {
            content: '抱歉，AI 服务暂时不可用，请稍后再试。'
          }
        }]
      }, { status: 500 });
    }

    const data = await response.json();
    
    // 更新统计
    // 如果有实际返回的 token 使用量，用实际值；否则用估算值
    const actualTokens = data.usage?.total_tokens || AVG_TOKENS_PER_CALL;
    const actualCost = (actualTokens / 1000) * COST_PER_1K_TOKENS;
    
    globalSpent += actualCost;
    globalRequestCount++;
    
    // 更新 IP 记录
    if (ipRecord) {
      ipRecord.count++;
    } else {
      ipUsageMap.set(ip, { count: 1, firstVisit: now });
    }
    
    // 检查是否触发全局关闭
    if (globalSpent >= GLOBAL_BUDGET_LIMIT) {
      isServiceClosed = true;
    }
    
    // 在响应头中添加状态信息（供前端展示）
    const remainingForThisIP = MAX_QUESTIONS_PER_PERSON - (ipRecord?.count || 0) - 1;
    const remainingBudget = getRemainingBudget();
    
    const headers = new Headers();
    headers.set('X-RateLimit-Remaining', String(Math.max(0, remainingForThisIP)));
    headers.set('X-Global-Budget-Remaining', formatMoney(remainingBudget));
    headers.set('X-Global-Status', getStatusMessage());
    
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

// 获取当前状态（用于前端展示）
export async function GET(req: NextRequest) {
  const ip = getClientIP(req);
  const ipRecord = ipUsageMap.get(ip);
  
  return NextResponse.json({
    global: {
      spent: formatMoney(globalSpent),
      budget: formatMoney(GLOBAL_BUDGET_LIMIT),
      remaining: formatMoney(getRemainingBudget()),
      percentUsed: Math.min(100, (globalSpent / GLOBAL_BUDGET_LIMIT) * 100).toFixed(1),
      status: getStatusMessage(),
      isClosed: isServiceClosed || globalSpent >= GLOBAL_BUDGET_LIMIT
    },
    personal: {
      used: ipRecord?.count || 0,
      limit: MAX_QUESTIONS_PER_PERSON,
      remaining: Math.max(0, MAX_QUESTIONS_PER_PERSON - (ipRecord?.count || 0))
    },
    deadline: {
      date: new Date(DEADLINE).toISOString(),
      isExpired: Date.now() > DEADLINE
    }
  });
}
