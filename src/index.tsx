import { Hono } from 'hono'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

// 主页路由
app.get('/', (c) => {
  return c.render(
    <div className="container">
      <header className="hero">
        <h1 className="title">🌟 Hello World! 🌟</h1>
        <p className="subtitle">欢迎来到Paul的第一个Hono网站</p>
      </header>
      
      <main className="content">
        <div className="card">
          <h2><i className="icon">🚀</i> 关于这个网站</h2>
          <p>这是一个使用 <strong>Hono框架</strong> 和 <strong>Cloudflare Pages</strong> 构建的简单Hello World网站。</p>
        </div>
        
        <div className="card">
          <h2><i className="icon">⚡</i> 技术特点</h2>
          <ul>
            <li>轻量级Hono框架</li>
            <li>边缘计算支持</li>
            <li>现代CSS样式</li>
            <li>响应式设计</li>
          </ul>
        </div>
        
        <div className="card">
          <h2><i className="icon">🎯</i> 快速链接</h2>
          <div className="buttons">
            <a href="/api/hello" className="button">测试API</a>
            <a href="/about" className="button">关于页面</a>
          </div>
        </div>
      </main>
      
      <footer className="footer">
        <p>© 2025 Hello World App - 由 <strong>Paul</strong> 制作 ❤️</p>
      </footer>
    </div>
  )
})

// API路由
app.get('/api/hello', (c) => {
  return c.json({ 
    message: 'Hello from Hono API!', 
    timestamp: new Date().toISOString(),
    author: 'Paul',
    tech: 'Hono + Cloudflare Pages'
  })
})

// 关于页面
app.get('/about', (c) => {
  return c.render(
    <div className="container">
      <header className="hero">
        <h1 className="title">📖 关于这个项目</h1>
        <p className="subtitle">技术栈详情</p>
      </header>
      
      <main className="content">
        <div className="card">
          <h2>🔧 技术栈</h2>
          <ul>
            <li><strong>框架:</strong> Hono.js</li>
            <li><strong>运行时:</strong> Cloudflare Workers</li>
            <li><strong>部署:</strong> Cloudflare Pages</li>
            <li><strong>语言:</strong> TypeScript</li>
            <li><strong>构建工具:</strong> Vite</li>
          </ul>
        </div>
        
        <div className="card">
          <h2>✨ 特性</h2>
          <ul>
            <li>极快的加载速度</li>
            <li>全球边缘部署</li>
            <li>零服务器维护</li>
            <li>现代化开发体验</li>
          </ul>
        </div>
        
        <div className="buttons">
          <a href="/" className="button">返回首页</a>
        </div>
      </main>
    </div>
  )
})

export default app
