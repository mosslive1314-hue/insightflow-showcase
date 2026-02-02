# InsightFlow - AI 产品经理调研助手

这是我的 Web Coding 训练营第 8 课毕业作品：一个基于 MiniMax 大模型的 AI 产品调研工具。

## 🚀 在线预览

部署在 Vercel：[你的链接]

## ✨ 功能特点

- 🤖 AI 数字分身：基于 MiniMax 大模型，可以回答关于项目的一切问题
- 📊 项目路演：展示痛点发现、解决方案、MVP 功能
- 📝 学习复盘：分享 AI 编程心得和学习路径
- 🎨 精美 UI：采用"未来实验室"设计风格，深色主题 + 霓虹青配色

## 🛠️ 技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI**: MiniMax API
- **部署**: Vercel

## 📦 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 MiniMax API Key

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 查看效果。

## 🔑 配置 MiniMax API

1. 去 [MiniMax 官网](https://www.minimaxi.com/) 注册账号
2. 在控制台获取 API Key
3. 创建 `.env.local` 文件，添加：
   ```
   NEXT_PUBLIC_MINIMAX_API_KEY=你的_api_key
   ```

## 📤 部署到 Vercel

```bash
# 构建
npm run build

# 部署到 Vercel（需要先安装 Vercel CLI）
vercel --prod
```

或者直接在 GitHub 上导入项目，Vercel 会自动部署。

## 📝 作业要求

### 7.1 基础作业：学习成果展示页
- ✅ 项目路演：痛点、MVP、产品思路
- ✅ 学习复盘：AI编程心得与学习路径
- ✅ 上线部署：GitHub + Vercel

### 7.2 进阶作业：AI 数字分身
- ✅ AI 交互：接入 MiniMax API
- ✅ 注入灵魂：System Prompt 设计
- ✅ 效果验证：AI 能回答项目相关问题

## 🎯 学习收获

通过这个项目，我学会了：
1. 用 AI 辅助编程（Claude、Kimi、Gemini 协作）
2. 前端工程化思维（Next.js + TypeScript）
3. AI 产品设计（提示词工程、对话设计）
4. 快速原型能力（从想法到部署只用几小时）

---

Made with 💙 during Web Coding Bootcamp 2026
