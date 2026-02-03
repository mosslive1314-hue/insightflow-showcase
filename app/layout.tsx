import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InsightFlow - AI产品经理调研助手',
  description: '一个基于MiniMax大模型的AI产品调研工具，为产品经理提供深度市场分析和竞品洞察',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 禁用缓存，确保总是加载最新代码 */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <style dangerouslySetInnerHTML={{__html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            background: #0A0A0F !important;
            color: white !important;
            font-family: system-ui, -apple-system, sans-serif;
            min-height: 100vh;
          }
        `}} />
      </head>
      <body className="antialiased">
        {/* 在页面上显示版本号 */}
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '8px',
          padding: '4px 8px',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          zIndex: 9999,
          pointerEvents: 'none'
        }}>
          v4.0-{new Date().getHours()}:{new Date().getMinutes()}
        </div>
        {children}
      </body>
    </html>
  )
}
