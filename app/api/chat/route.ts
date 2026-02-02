import { NextRequest, NextResponse } from 'next/server';

// 简单的内存级速率限制器
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// 配置参数
const RATE_LIMIT = 3; // 每周期最多请求次数
const RATE_LIMIT_WINDOW = 60 * 1000; // 时间窗口：60秒
const DEADLINE = new Date('2026-02-15T23:59:59+08:00').getTime(); // 作业截止日期后自动关闭
const MAX_TOKENS_PER_REQUEST = 500; // 降低单次调用的 token 上限，减少费用

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    // 新周期
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

export async function POST(req: NextRequest) {
  // 1. 检查是否已过截止日期（自动关闭）
  const now = Date.now();
  if (now > DEADLINE) {
    return NextResponse.json({
      choices: [{
        message: {
          content: '🔒 AI 对话功能已自动关闭。感谢访问 InsightFlow 展示页！如需了解更多，请联系作者。'
        }
      }]
    });
  }
  
  // 2. 速率限制检查
  const ip = getClientIP(req);
  const rateLimit = checkRateLimit(ip);
  
  if (!rateLimit.allowed) {
    return NextResponse.json({
      choices: [{
        message: {
          content: `⏳ 请求太频繁了，请 ${Math.ceil(rateLimit.resetIn / 1000)} 秒后再试。为保护 API 额度，每分钟仅限 ${RATE_LIMIT} 次对话。`
        }
      }]
    }, { status: 429 });
  }
  
  try {
    const { messages } = await req.json();
    const apiKey = process.env.MINIMAX_API_KEY || '';
    
    // 3. 检查 API Key
    if (!apiKey) {
      return NextResponse.json({
        choices: [{
          message: {
            content: '⚠️ API Key 未配置，请联系管理员。'
          }
        }]
      }, { status: 500 });
    }
    
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
        max_tokens: MAX_TOKENS_PER_REQUEST // 限制输出长度，节省费用
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
    return NextResponse.json(data);
    
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
