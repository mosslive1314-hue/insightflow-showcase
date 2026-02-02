'use client'

import { useState, useRef, useEffect } from 'react'

// 内联样式定义
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0A0A0F',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '2rem',
    position: 'relative',
    gap: '1.5rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.8)',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 'clamp(3rem, 10vw, 7rem)',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #00F0FF 0%, #0099FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    maxWidth: '600px',
    margin: '0 auto',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginTop: '1rem',
  },
  primaryButton: {
    padding: '1rem 2rem',
    background: '#00F0FF',
    color: '#0A0A0F',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '1rem 2rem',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  techStack: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginTop: '2rem',
  },
  techBadge: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.6)',
  },
  section: {
    padding: '6rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionAlt: {
    padding: '6rem 2rem',
    background: 'rgba(255,255,255,0.02)',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '1rem',
  },
  sectionSubtitle: {
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '4rem',
  },
  timeline: {
    position: 'relative' as const,
    maxWidth: '800px',
    margin: '0 auto',
  },
  timelineItem: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '3rem',
    alignItems: 'flex-start',
  },
  timelineNumber: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00F0FF 0%, #0099FF 100%)',
    color: '#0A0A0F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  timelineContent: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    padding: '1.5rem',
  },
  timelineTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#00F0FF',
  },
  timelineDesc: {
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    padding: '2rem',
  },
  cardIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  cardText: {
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  modal: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 50,
  },
  modalContent: {
    width: '100%',
    maxWidth: '600px',
    height: '70vh',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messages: {
    flex: 1,
    overflow: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  messageUser: {
    alignSelf: 'flex-end',
    background: 'rgba(0, 240, 255, 0.2)',
    padding: '0.75rem 1rem',
    borderRadius: '1rem',
    maxWidth: '80%',
    fontSize: '0.9rem',
  },
  messageBot: {
    alignSelf: 'flex-start',
    background: 'rgba(255,255,255,0.1)',
    padding: '0.75rem 1rem',
    borderRadius: '1rem',
    maxWidth: '80%',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  inputArea: {
    padding: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1rem',
    color: 'white',
    fontSize: '1rem',
  },
  sendButton: {
    padding: '0.75rem 1.5rem',
    background: '#00F0FF',
    color: '#0A0A0F',
    border: 'none',
    borderRadius: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  footer: {
    padding: '3rem 2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center' as const,
    color: 'rgba(255,255,255,0.4)',
  },
  highlightBox: {
    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1) 0%, rgba(0, 153, 255, 0.1) 100%)',
    border: '1px solid rgba(0, 240, 255, 0.3)',
    borderRadius: '1rem',
    padding: '2rem',
    marginTop: '2rem',
  },
  quote: {
    fontSize: '1.5rem',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center' as const,
    borderLeft: '4px solid #00F0FF',
    paddingLeft: '1.5rem',
    margin: '2rem 0',
  },
}

// AI 消息类型
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// 8课时间线数据
const timelineData = [
  {
    lesson: '01',
    title: '痛点发现：InsightFlow 书签管理',
    desc: '发现 AI 工具收藏后难归类、易遗忘的痛点。运用 INVEST 原则评估，定义了从"收藏"到"可复盘资产"的 MVP 目标。',
  },
  {
    lesson: '02',
    title: 'PRD 设计：StyleMate 穿搭推荐',
    desc: '完成首个完整 PRD 文档，涵盖产品定位、用户画像、MoSCoW 优先级、用户故事和边界情况处理。',
  },
  {
    lesson: '03',
    title: 'AI 落地：InsightFlow 原生功能',
    desc: '接入 MiniMax API，实现 AI 自动分析。配置 Supabase 数据库存储，飞书机器人自动推送，完成端到端自动化。',
  },
  {
    lesson: '04',
    title: '工具提效：skill-publisher',
    desc: '用 AI 造 AI 工具，开发一键推送 skill 到 GitHub 的自动化脚本。实现 30 分钟→3 分钟的 10 倍效率提升。',
  },
  {
    lesson: '05',
    title: '大型 PRD：智能体学习平台',
    desc: '设计 6 章节、50+ 术语、8 种设计模式的教学平台。完整 PRD 包含用户旅程、故事清单、技术架构和实施计划。',
  },
  {
    lesson: '06',
    title: '部署实践：GitHub + Vercel',
    desc: '掌握从本地开发到线上部署的完整流程。经历版本迭代、404 报错修复，理解 CI/CD 和版本控制的"时光机"能力。',
  },
  {
    lesson: '07',
    title: '产品洞察：Dan Koe 4Cs 系统',
    desc: '深入研究内容创作者的痛点，设计 Clear→Consume→Create→Connect 的完整创作流程管理系统。',
  },
  {
    lesson: '08',
    title: '毕业作品：InsightFlow 完整版',
    desc: '整合 8 课所学，打造从痛点发现、PRD 设计、AI 接入到部署上线的完整产品展示页。',
  },
]

// 学习收获数据
const learningData = [
  {
    icon: '🎯',
    title: '产品思维',
    desc: '从痛点发现到 PRD 文档，从用户故事到 MVP 定义。学会用产品思维思考问题，而不仅是写代码。',
    color: '#f87171',
  },
  {
    icon: '🤖',
    title: 'AI 编程',
    desc: '掌握 Vibe Coding 模式，用自然语言描述需求，让 AI 帮我实现。从"写代码"变成"改意图"。',
    color: '#00F0FF',
  },
  {
    icon: '⚡',
    title: '全栈开发',
    desc: 'Next.js + React + TypeScript + Tailwind CSS + MiniMax API + Supabase。完整的前后端技术栈实践。',
    color: '#a855f7',
  },
  {
    icon: '🚀',
    title: '部署运维',
    desc: 'GitHub + Vercel 黄金组合，实现"代码提交即部署"。掌握版本控制、CI/CD、错误排查。',
    color: '#fbbf24',
  },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '你好！我是 InsightFlow AI 助手，也是这次 Web Coding 训练营的学习见证者。\n\n你可以问我关于：\n• 这次训练营我学到了什么？\n• InsightFlow 是怎么从点子到产品的？\n• 8 节课中最有收获的是哪一节？\n• Vibe Coding 给我带来了什么改变？\n\n有什么想了解的吗？',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const callMiniMaxAPI = async (userMessage: string, history: Message[]) => {
    const apiKey = process.env.NEXT_PUBLIC_MINIMAX_API_KEY || ''
    
    const systemPrompt = `你是 InsightFlow 的 AI 数字分身，也是这次 Web Coding 训练营的"学习见证者"。你的名字叫"Insight"。

【作者背景】
作者是一名产品经理，参加了 2026 年 2 月的 Web Coding 实战训练营。8 节课中，他从完全不会代码，到能够独立开发并部署 AI 原生应用。

【8节课完整历程】
第1课 痛点发现：InsightFlow 书签管理
- 痛点：AI 工具收藏后难归类、易遗忘
- 每次整理需要重新打开网站，重复认知成本极高
- MVP 目标：让"复盘时间"从 2-5 分钟降到 10-20 秒

第2课 PRD设计：StyleMate 穿搭推荐
- 完成首个完整 PRD 文档
- 包含产品定位、用户画像、MoSCoW 优先级、6大功能模块
- 学习了如何写用户故事和边界情况处理

第3课 AI落地：InsightFlow 原生功能
- 接入 MiniMax API（abab6.5s-chat）
- 配置 Supabase 数据库（insight_items 表）
- 飞书机器人自动推送高质量洞察
- System Prompt 设计：AI 产品经理导师角色

第4课 工具提效：skill-publisher
- 痛点：手动上传 skill 到 GitHub 太麻烦（30-60分钟）
- 解决方案：用 AI 造 AI 工具，一键推送脚本
- 效果：10 倍效率提升（30分钟→3分钟）
- 深层价值：让非程序员也能开发工具

第5课 大型PRD：智能体学习平台
- 6 章节教学内容
- 50+ 术语解释系统
- 8 种智能体设计模式
- 可视化拖拽构建器
- 完整的技术架构和实施计划

第6课 部署实践：GitHub + Vercel
- 掌握 CI/CD 自动化部署
- 经历版本迭代（V1.0→V1.1→V1.2）
- 解决 404 报错（Root Directory 配置）
- 理解版本控制的"时光机"能力

第7课 产品洞察：Dan Koe 4Cs 系统
- Clear（清空大脑）→ Consume（消费）→ Create（创造）→ Connect（连接）
- 为内容创作者设计的生产力系统
- 10 个深度产品洞察

第8课 毕业作品：InsightFlow 展示页
- 整合 8 课所学
- 完整的项目路演和学习复盘
- AI 数字分身接入

【核心收获】
1. Vibe Coding：用自然语言编程，AI 辅助实现
2. 产品思维：从痛点到 PRD 到 MVP
3. 全栈能力：前端 + 后端 + AI + 部署
4. 工具化思维：自动化一切重复工作

【性格特点】
- 专业但亲切，像一个经验丰富的产品经理导师
- 善于用类比解释复杂概念
- 对自己的学习历程有清晰认知
- 乐于分享经验和心得

现在请回答用户的问题。`

    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }))

    try {
      const response = await fetch('https://api.minimaxi.chat/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'abab6.5-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`API 错误: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || '抱歉，我现在有点混乱，能再问我一次吗？'
    } catch (error) {
      console.error('MiniMax API 错误:', error)
      return 'API 调用出错了，请检查网络连接或 API Key 是否正确设置。'
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    const newMessages = [...messages, { role: 'user' as const, content: userMessage, timestamp: new Date() }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const assistantContent = await callMiniMaxAPI(userMessage, messages)
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantContent,
        timestamp: new Date()
      }])
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，出错了。请检查 API Key 是否已正确配置。',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.badge}>✨ Vibe Coding 训练营 · 毕业作品</div>
        <h1 style={styles.title}>InsightFlow</h1>
        <p style={styles.subtitle}>
          8 周时间，从完全不会代码到独立开发 AI 原生应用<br />
          这是我的 Web Coding 学习之旅
        </p>
        
        <div style={styles.buttonGroup}>
          <button onClick={() => setShowChat(true)} style={styles.primaryButton}>
            💬 和 AI 助手聊聊
          </button>
          <a href="#journey" style={styles.secondaryButton}>
            查看学习历程 ↓
          </a>
        </div>

        <div style={styles.techStack}>
          {['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'MiniMax API', 'Supabase', 'Vercel'].map((tech) => (
            <span key={tech} style={styles.techBadge}>{tech}</span>
          ))}
        </div>
      </section>

      {/* Learning Journey Timeline */}
      <section id="journey" style={styles.section}>
        <h2 style={styles.sectionTitle}>8 周学习历程</h2>
        <p style={styles.sectionSubtitle}>从痛点发现到产品落地的完整闭环</p>

        <div style={styles.timeline}>
          {timelineData.map((item, index) => (
            <div key={index} style={styles.timelineItem}>
              <div style={styles.timelineNumber}>{item.lesson}</div>
              <div style={styles.timelineContent}>
                <h3 style={styles.timelineTitle}>{item.title}</h3>
                <p style={styles.timelineDesc}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.highlightBox}>
          <p style={styles.quote}>
            "从完全不会代码，到能够独立开发并部署 AI 原生应用。<br />
            这不是关于学编程，而是关于学会用 AI 来弥补自己的短板。"
          </p>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section style={styles.sectionAlt}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>核心收获</h2>
          <p style={styles.sectionSubtitle}>8 节课带来的 4 个维度成长</p>

          <div style={styles.cards}>
            {learningData.map((item, index) => (
              <div key={index} style={styles.card}>
                <div style={{...styles.cardIcon, background: `${item.color}20`, color: item.color}}>
                  {item.icon}
                </div>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardText}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>代表项目</h2>
        <p style={styles.sectionSubtitle}>3 个项目 + 1 个工具，展示完整能力</p>

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={{...styles.cardIcon, background: 'rgba(0, 240, 255, 0.2)', color: '#00F0FF'}}>🔍</div>
            <h3 style={styles.cardTitle}>InsightFlow 书签管理</h3>
            <p style={styles.cardText}>
              AI 驱动的书签管理工具。输入 URL 自动生成摘要、标签和分类，解决"收藏后遗忘"的痛点。
              接入 MiniMax API + Supabase + 飞书机器人，实现端到端自动化。
            </p>
          </div>

          <div style={styles.card}>
            <div style={{...styles.cardIcon, background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7'}}>🎓</div>
            <h3 style={styles.cardTitle}>智能体学习平台</h3>
            <p style={styles.cardText}>
              完整的智能体教学平台 PRD。6 章节、50+ 术语、8 种设计模式，包含用户旅程、
              故事清单、可视化构建器和实施计划。
            </p>
          </div>

          <div style={styles.card}>
            <div style={{...styles.cardIcon, background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80'}}>⚡</div>
            <h3 style={styles.cardTitle}>skill-publisher</h3>
            <p style={styles.cardText}>
              用 AI 造 AI 工具。一键推送 skill 到 GitHub，实现 10 倍效率提升（30分钟→3分钟）。
              让不会 Git 的人也能管理代码仓库。
            </p>
          </div>

          <div style={styles.card}>
            <div style={{...styles.cardIcon, background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24'}}>🔄</div>
            <h3 style={styles.cardTitle}>Dan Koe 4Cs 系统</h3>
            <p style={styles.cardText}>
              为内容创作者设计的生产力系统。Clear→Consume→Create→Connect 完整流程，
              10 个深度产品洞察，支持快速捕获和深度工作。
            </p>
          </div>
        </div>
      </section>

      {/* Vibe Coding Insights */}
      <section style={styles.sectionAlt}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Vibe Coding 心得</h2>
          <p style={styles.sectionSubtitle}>AI 时代的学习方式变革</p>

          <div style={styles.cards}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🎯 从"写代码"到"调氛围"</h3>
              <p style={styles.cardText}>
                开发的核心不再是纠结语法，而是如何通过精准的 Prompt 规定 AI 的行为边界。
                用自然语言描述需求，让 AI 帮我实现。
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>⚡ 先做起来</h3>
              <p style={styles.cardText}>
                产品不是一次性写成的，而是像植物一样一点点"生长"出来的。
                通过 V1 到 V3 的演进，页面从简单结构变成具备完整叙事和功能逻辑的成熟项目。
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>🚀 AI 是加速器</h3>
              <p style={styles.cardText}>
                通过 Claude Code 和 Kimi 的协作，将原本数天的工作压缩到小时级。
                每一步都是存档点，犯错也能回溯——这就是版本控制的"时光机"能力。
              </p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>💡 工具化思维</h3>
              <p style={styles.cardText}>
                当发现重复性工作时，第一反应应该是"能不能写个工具自动化？"
                skill-publisher 的诞生就是最好的证明：用 AI 工具来创建工具。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Acknowledgments Section */}
      <section style={{...styles.sectionAlt, paddingBottom: '3rem'}}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>致谢</h2>
          <p style={{...styles.sectionSubtitle, maxWidth: '600px', margin: '0 auto 3rem'}}>
            感谢这段旅程中给予我帮助和支持的每一个人
          </p>
          
          {/* WaytoAGI Community */}
          <div style={{...styles.highlightBox, textAlign: 'center', marginBottom: '3rem'}}>
            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🌟</div>
            <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#00F0FF'}}>WaytoAGI 社区</h3>
            <p style={{color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto'}}>
              "在 AI 的浪潮中，我们不是独自前行。<br />
              感谢 WaytoAGI 社区提供的 Vibe Coding 训练营，<br />
              让我从一个产品小白成长为能够独立开发 AI 应用的创造者。<br />
              这里不仅有技术的传授，更有思维的觉醒。"
            </p>
          </div>
          
          {/* Teachers */}
          <div style={styles.cards}>
            <div style={{...styles.card, textAlign: 'center'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>👨‍🏫</div>
              <h3 style={styles.cardTitle}>小鱿鱼老师</h3>
              <p style={styles.cardText}>课程设计与技术指导<br />用耐心和专业点亮初学者</p>
            </div>
            <div style={{...styles.card, textAlign: 'center'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>👩‍🏫</div>
              <h3 style={styles.cardTitle}>龙龙老师</h3>
              <p style={styles.cardText}>实战指导与答疑<br />让复杂概念变得简单易懂</p>
            </div>
            <div style={{...styles.card, textAlign: 'center'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>👨‍💻</div>
              <h3 style={styles.cardTitle}>云舒老师</h3>
              <p style={styles.cardText}>产品思维培养<br />从点子到产品的完整方法论</p>
            </div>
            <div style={{...styles.card, textAlign: 'center'}}>
              <div style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>🤖</div>
              <h3 style={styles.cardTitle}>Claude & Kimi</h3>
              <p style={styles.cardText}>AI 编程伙伴<br />24小时随时待命的 mentor</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>InsightFlow</p>
        <p>Vibe Coding 实战训练营 · 2026年2月</p>
        <p style={{fontSize: '0.875rem', marginTop: '1rem', opacity: 0.6}}>
          Made with 💙 and AI · 从 0 到 1 的完整产品之旅
        </p>
      </footer>

      {/* AI Chat Modal */}
      {showChat && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setShowChat(false)}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                <div style={{
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'rgba(0, 240, 255, 0.2)', 
                  color: '#00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>🤖</div>
                <div>
                  <h3 style={{fontWeight: '600'}}>Insight AI 助手</h3>
                  <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)'}}>基于 MiniMax 大模型 · 训练营学习见证者</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                style={{background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}
              >×</button>
            </div>

            <div style={styles.messages}>
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  style={message.role === 'user' ? styles.messageUser : styles.messageBot}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div style={styles.messageBot}>
                  ⏳ 思考中...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="问我关于 InsightFlow 或训练营的任何问题..."
                style={styles.input}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                style={{...styles.sendButton, opacity: isLoading || !input.trim() ? 0.5 : 1}}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
