import { Hono } from 'hono'
import { renderer } from './renderer'
import type { Env, Blog, ApiResponse } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use(renderer)

// 数据库初始化函数
async function initDatabase(db: D1Database) {
  try {
    // 创建表结构
    await db.exec(`
      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author TEXT DEFAULT 'Paul',
        slug TEXT UNIQUE,
        published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 检查是否已有数据
    const count = await db.prepare('SELECT COUNT(*) as count FROM blogs').first<{count: number}>();
    
    if (count?.count === 0) {
      // 插入示例数据
      const sampleBlogs = [
        {
          title: '欢迎来到我的博客',
          content: '# 欢迎来到我的技术博客\n\n这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。\n\n## 关于我\n我是一个热爱技术的程序员，专注于现代Web开发技术栈。',
          excerpt: '这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。',
          slug: 'welcome-to-my-blog',
          published: 1
        },
        {
          title: 'Hono框架深度解析',
          content: '# Hono框架深度解析\n\nHono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。\n\n## 为什么选择Hono？\n- 比Express.js快10倍以上\n- 专门为Cloudflare Workers优化\n- 零冷启动时间',
          excerpt: 'Hono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。',
          slug: 'hono-framework-deep-dive',
          published: 1
        },
        {
          title: 'Cloudflare Pages最佳实践',
          content: '# Cloudflare Pages最佳实践\n\n作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。\n\n## 核心优势\n- 200+国家数据中心\n- 毫秒级响应时间\n- 自动CDN加速',
          excerpt: '作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。',
          slug: 'cloudflare-pages-best-practices',
          published: 1
        }
      ];
      
      for (const blog of sampleBlogs) {
        await db.prepare(`
          INSERT INTO blogs (title, content, excerpt, slug, published)
          VALUES (?, ?, ?, ?, ?)
        `).bind(blog.title, blog.content, blog.excerpt, blog.slug, blog.published).run();
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 主页路由 - 显示博客列表
app.get('/', async (c) => {
  let blogs: Blog[] = [];
  let dbError = null;
  
  try {
    const { env } = c;
    if (env?.DB) {
      try {
        // 初始化数据库
        await initDatabase(env.DB);
        
        // 获取已发布的博客列表
        const result = await env.DB.prepare(`
          SELECT id, title, excerpt, author, slug, created_at
          FROM blogs 
          WHERE published = 1 
          ORDER BY created_at DESC
          LIMIT 10
        `).all<Blog>();
        
        blogs = result.results || [];
      } catch (dbErr) {
        console.warn('Database error, using mock data:', dbErr);
        blogs = getMockBlogs();
        dbError = dbErr;
      }
    } else {
      // 开发环境使用模拟数据
      blogs = getMockBlogs();
    }
  } catch (error) {
    console.error('General error:', error);
    blogs = getMockBlogs();
    dbError = error;
  }
  
  return c.render(
    <div className="container">
      <header className="hero">
        <h1 className="title">🌟 Paul的技术博客 🌟</h1>
        <p className="subtitle">分享Web开发经验与技术心得</p>
      </header>
      
      <main className="content">
        {/* 博客列表 */}
        {blogs.length > 0 ? (
          <section className="blog-section">
            <h2 className="section-title">
              <i className="icon">📝</i> 最新博客文章
            </h2>
            <div className="blog-list">
              {blogs.map((blog) => (
                <article key={blog.id} className="blog-card">
                  <h3 className="blog-title">
                    <a href={`/blog/${blog.slug}`}>{blog.title}</a>
                  </h3>
                  <p className="blog-excerpt">{blog.excerpt}</p>
                  <div className="blog-meta">
                    <span className="author">✍️ {blog.author}</span>
                    <span className="date">📅 {new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <a href={`/blog/${blog.slug}`} className="read-more">阅读全文 →</a>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="card">
            <h2><i className="icon">📝</i> 博客文章</h2>
            {dbError ? (
              <p>🔧 数据库正在初始化中，请稍后刷新页面...</p>
            ) : (
              <p>暂无博客文章，敬请期待...</p>
            )}
          </div>
        )}
        
        {/* 快速链接 */}
        <div className="card">
          <h2><i className="icon">🎯</i> 快速链接</h2>
          <div className="buttons">
            <a href="/api/blogs" className="button">博客API</a>
            <a href="/api/hello" className="button">测试API</a>
            <a href="/about" className="button">关于我</a>
          </div>
        </div>
        
        {/* 技术栈 */}
        <div className="card">
          <h2><i className="icon">⚡</i> 技术特点</h2>
          <ul>
            <li>轻量级Hono框架</li>
            <li>Cloudflare D1数据库</li>
            <li>边缘计算支持</li>
            <li>现代CSS样式</li>
            <li>响应式设计</li>
          </ul>
        </div>
      </main>
      
      <footer className="footer">
        <p>© 2025 Paul的技术博客 - 由 <strong>Hono + Cloudflare</strong> 强力驱动 🚀</p>
      </footer>
    </div>
  )
})

// 模拟博客数据（开发环境用）
const getMockBlogs = (): Blog[] => [
  {
    id: 1,
    title: '欢迎来到我的博客',
    content: '# 欢迎来到我的技术博客\n\n这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。\n\n## 关于我\n我是一个热爱技术的程序员，专注于现代Web开发技术栈。\n\n## 技术栈\n- **前端**: JavaScript, HTML5, CSS3, TailwindCSS\n- **后端**: Hono.js, Node.js\n- **云服务**: Cloudflare Workers, Cloudflare Pages\n- **数据库**: D1 SQLite',
    excerpt: '这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。',
    author: 'Paul',
    slug: 'welcome-to-my-blog',
    published: 1,
    created_at: '2025-07-16T08:00:00.000Z',
    updated_at: '2025-07-16T08:00:00.000Z'
  },
  {
    id: 2,
    title: 'Hono框架深度解析',
    content: '# Hono框架深度解析\n\nHono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。\n\n## 为什么选择Hono？\n\n### 1. 极速性能\n- 比Express.js快10倍以上\n- 专门为Cloudflare Workers优化\n- 零冷启动时间\n\n### 2. 现代化API设计\n```typescript\nimport { Hono } from "hono"\n\nconst app = new Hono()\n\napp.get("/", (c) => {\n  return c.json({ message: "Hello Hono!" })\n})\n```',
    excerpt: 'Hono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。',
    author: 'Paul',
    slug: 'hono-framework-deep-dive',
    published: 1,
    created_at: '2025-07-15T10:30:00.000Z',
    updated_at: '2025-07-15T10:30:00.000Z'
  },
  {
    id: 3,
    title: 'Cloudflare Pages最佳实践',
    content: '# Cloudflare Pages最佳实践\n\n作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。\n\n## 核心优势\n\n### 🚀 全球边缘网络\n- 200+国家数据中心\n- 毫秒级响应时间\n- 自动CDN加速\n\n### 💰 成本效益\n- 免费额度足够个人项目\n- 按需付费，无隐藏费用',
    excerpt: '作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。',
    author: 'Paul',
    slug: 'cloudflare-pages-best-practices',
    published: 1,
    created_at: '2025-07-14T14:15:00.000Z',
    updated_at: '2025-07-14T14:15:00.000Z'
  },
  {
    id: 4,
    title: 'TypeScript开发技巧分享',
    content: '# TypeScript开发技巧分享\n\nTypeScript已经成为现代JavaScript开发的标准。以下是我在实际项目中总结的一些实用技巧。\n\n## 类型安全最佳实践\n\n### 1. 严格类型检查\n```typescript\n// tsconfig.json\n{\n  "compilerOptions": {\n    "strict": true,\n    "noImplicitAny": true,\n    "noImplicitReturns": true\n  }\n}\n```',
    excerpt: 'TypeScript已经成为现代JavaScript开发的标准。以下是我在实际项目中总结的一些实用技巧。',
    author: 'Paul',
    slug: 'typescript-development-tips',
    published: 1,
    created_at: '2025-07-13T16:45:00.000Z',
    updated_at: '2025-07-13T16:45:00.000Z'
  }
];

// 博客API路由
app.get('/api/blogs', async (c) => {
  try {
    const { env } = c;
    let blogs: Blog[] = [];
    
    // 尝试使用数据库，如果失败则使用模拟数据
    if (env?.DB) {
      try {
        await initDatabase(env.DB);
        const result = await env.DB.prepare(`
          SELECT id, title, excerpt, author, slug, created_at
          FROM blogs 
          WHERE published = 1 
          ORDER BY created_at DESC
        `).all<Blog>();
        blogs = result.results || [];
      } catch (dbError) {
        console.warn('Database error, using mock data:', dbError);
        blogs = getMockBlogs();
      }
    } else {
      // 开发环境使用模拟数据
      blogs = getMockBlogs();
    }
    
    return c.json<ApiResponse<Blog[]>>({
      success: true,
      data: blogs,
      message: `Found ${blogs.length} published blogs`
    });
  } catch (error) {
    console.error('Blog API error:', error);
    // 失败时使用模拟数据
    return c.json<ApiResponse<Blog[]>>({
      success: true,
      data: getMockBlogs(),
      message: 'Using mock data due to database error'
    });
  }
});

// 获取单个博客文章
app.get('/blog/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const { env } = c;
    let blog: Blog | null = null;
    
    // 尝试从数据库获取，失败则使用模拟数据
    if (env?.DB) {
      try {
        await initDatabase(env.DB);
        blog = await env.DB.prepare(`
          SELECT * FROM blogs WHERE slug = ? AND published = 1
        `).bind(slug).first<Blog>();
      } catch (dbError) {
        console.warn('Database error, using mock data:', dbError);
        blog = getMockBlogs().find(b => b.slug === slug) || null;
      }
    } else {
      // 开发环境使用模拟数据
      blog = getMockBlogs().find(b => b.slug === slug) || null;
    }
    
    if (!blog) {
      return c.render(
        <div className="container">
          <div className="card">
            <h2>❌ 文章未找到</h2>
            <p>您访问的博客文章不存在或已被删除。</p>
            <a href="/" className="button">返回首页</a>
          </div>
        </div>
      );
    }
    
    return c.render(
      <div className="container">
        <article className="blog-article">
          <header className="blog-header">
            <h1 className="blog-title-full">{blog.title}</h1>
            <div className="blog-meta-full">
              <span className="author">✍️ {blog.author}</span>
              <span className="date">📅 {new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
          </header>
          
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br>') }} />
          
          <footer className="blog-footer">
            <div className="buttons">
              <a href="/" className="button">← 返回首页</a>
              <a href={`/api/blogs`} className="button">查看所有文章</a>
            </div>
          </footer>
        </article>
      </div>
    );
  } catch (error) {
    console.error('Blog detail error:', error);
    return c.render(
      <div className="container">
        <div className="card">
          <h2>❌ 加载错误</h2>
          <p>文章加载失败，请稍后再试。</p>
          <a href="/" className="button">返回首页</a>
        </div>
      </div>
    );
  }
});

// Hello API路由
app.get('/api/hello', (c) => {
  return c.json({ 
    message: 'Hello from Hono API!', 
    timestamp: new Date().toISOString(),
    author: 'Paul',
    tech: 'Hono + Cloudflare Pages + D1 Database'
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