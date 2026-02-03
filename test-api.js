// 测试 MiniMax API Key 是否有效
// 使用方法：在终端运行 node test-api.js

const API_KEY = process.env.MINIMAX_API_KEY || '你的API_Key';

async function testMiniMaxAPI() {
  console.log('=== MiniMax API Key 测试 ===\n');

  console.log('1. API Key 状态:', API_KEY && API_KEY !== '你的API_Key' ? '✓ 已设置' : '✗ 未设置');
  console.log('2. API Key 长度:', API_KEY.length);
  console.log('3. API Key 前缀:', API_KEY.substring(0, 10) + '...');
  console.log('4. API Key 后缀:', '...' + API_KEY.substring(API_KEY.length - 10));
  console.log('5. 是否包含空格:', API_KEY.includes(' ') || API_KEY.includes('\n') || API_KEY.includes('\t') ? '✗ 是（有问题）' : '✓ 否（正常）');
  console.log('6. API Key 类型:', API_KEY.startsWith('sk-cp-') ? 'Coding Plan Key' : API_KEY.startsWith('sk-') ? 'General API Key' : '未知格式');
  console.log();

  if (API_KEY === '你的API_Key' || !API_KEY) {
    console.log('❌ 请先设置 API Key！');
    console.log('\n方法1：设置环境变量');
    console.log('  export MINIMAX_API_KEY=你的API_Key');
    console.log('\n方法2：直接修改本文件第3行');
    return;
  }

  console.log('开始测试 API 调用...\n');

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'user', content: '你好' }
        ],
        max_tokens: 50
      })
    });

    console.log('HTTP 状态码:', response.status);

    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));

    if (data.base_resp) {
      console.log('\n=== MiniMax API 响应 ===');
      console.log('状态码:', data.base_resp.status_code);
      console.log('状态信息:', data.base_resp.status_msg || '成功');

      if (data.base_resp.status_code === 0) {
        console.log('\n✅ API Key 有效！调用成功！');
        console.log('AI 回复:', data.choices[0]?.message?.content);
      } else if (data.base_resp.status_code === 2049) {
        console.log('\n❌ API Key 无效！');
        console.log('\n可能的原因：');
        console.log('1. API Key 类型不匹配（Coding Plan vs General API）');
        console.log('2. API Key 已过期或被撤销');
        console.log('3. 账户余额不足');
        console.log('4. API Key 没有使用 abab6.5s-chat 模型的权限');
      }
    }

  } catch (error) {
    console.error('\n❌ 网络错误:', error.message);
  }
}

testMiniMaxAPI();
