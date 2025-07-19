import { Hono } from 'hono'
import { renderer } from './renderer'
import { serveStatic } from 'hono/cloudflare-workers'
import { setCookie, getCookie } from 'hono/cookie'
import type { Env, Blog, ApiResponse } from './types'

const app = new Hono<{ Bindings: Env }>()

// 服务静态文件
app.use('/static/*', serveStatic({ root: './dist' }))

app.use(renderer)

// 管理员认证中间件
const requireAuth = async (c: any, next: any) => {
  const isAdminPath = c.req.path.startsWith('/admin') && c.req.path !== '/admin/login'
  if (isAdminPath) {
    const token = getCookie(c, 'admin_token')
    if (token !== 'admin_authenticated_token_123') {
      return c.redirect('/admin/login')
    }
  }
  await next()
}

app.use('*', requireAuth)

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
    let otherBlogs: Blog[] = [];
    
    // 尝试从数据库获取，失败则使用模拟数据
    if (env?.DB) {
      try {
        await initDatabase(env.DB);
        blog = await env.DB.prepare(`
          SELECT * FROM blogs WHERE slug = ? AND published = 1
        `).bind(slug).first<Blog>();
        
        // 获取其他3篇最新博客（排除当前文章）
        const otherBlogsResult = await env.DB.prepare(`
          SELECT id, title, slug, created_at, excerpt
          FROM blogs 
          WHERE published = 1 AND slug != ?
          ORDER BY created_at DESC
          LIMIT 3
        `).bind(slug).all<Blog>();
        otherBlogs = otherBlogsResult.results || [];
      } catch (dbError) {
        console.warn('Database error, using mock data:', dbError);
        const mockBlogs = getMockBlogs();
        blog = mockBlogs.find(b => b.slug === slug) || null;
        otherBlogs = mockBlogs.filter(b => b.slug !== slug).slice(0, 3);
      }
    } else {
      // 开发环境使用模拟数据
      const mockBlogs = getMockBlogs();
      blog = mockBlogs.find(b => b.slug === slug) || null;
      otherBlogs = mockBlogs.filter(b => b.slug !== slug).slice(0, 3);
    }
    
    if (!blog) {
      return c.render(
        <div className="blog-detail-container">
          <div className="blog-error">
            <div className="error-content">
              <h2>❌ 文章未找到</h2>
              <p>您访问的博客文章不存在或已被删除。</p>
              <a href="/" className="button">返回首页</a>
            </div>
          </div>
        </div>
      );
    }
    
    return c.render(
      <div className="blog-detail-container">
        {/* 左侧导航 */}
        <aside className="blog-sidebar">
          <div className="sidebar-header">
            <h3>其他文章</h3>
          </div>
          <nav className="sidebar-nav">
            {otherBlogs.map((otherBlog) => (
              <article key={otherBlog.id} className="sidebar-blog-card">
                <h4 className="sidebar-blog-title">
                  <a href={`/blog/${otherBlog.slug}`}>{otherBlog.title}</a>
                </h4>
                <p className="sidebar-blog-excerpt">{otherBlog.excerpt}</p>
                <div className="sidebar-blog-date">
                  📅 {new Date(otherBlog.created_at).toLocaleDateString('zh-CN')}
                </div>
              </article>
            ))}
            <div className="sidebar-footer">
              <a href="/" className="sidebar-home-link">← 返回首页</a>
            </div>
          </nav>
        </aside>
        
        {/* 主要内容区域 */}
        <main className="blog-main">
          <article className="blog-article-new">
            {/* 文章头部 */}
            <header className="blog-header-new">
              <h1 className="blog-title-new">{blog.title}</h1>
              <div className="blog-meta-new">
                <span className="blog-author">✍️ {blog.author}</span>
                <span className="blog-date">📅 {new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </header>
            
            {/* 文章内容 */}
            <div className="blog-content-new" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br>') }} />
            
            {/* 文章底部 */}
            <footer className="blog-footer-new">
              <div className="blog-tags">
                <span className="tag">技术博客</span>
                <span className="tag">Web开发</span>
              </div>
              <div className="blog-actions">
                <a href="/api/blogs" className="action-link">查看所有文章</a>
              </div>
            </footer>
          </article>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Blog detail error:', error);
    return c.render(
      <div className="blog-detail-container">
        <div className="blog-error">
          <div className="error-content">
            <h2>❌ 加载错误</h2>
            <p>文章加载失败，请稍后再试。</p>
            <a href="/" className="button">返回首页</a>
          </div>
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

// 管理后台登录页面
app.get('/admin/login', (c) => {
  return c.render(
    <div className="admin-login-container">
      <div className="login-form-wrapper">
        <div className="login-header">
          <h1>🔐 博客管理后台</h1>
          <p>请输入管理员账号登录</p>
        </div>
        <form className="login-form" action="/admin/login" method="POST">
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input type="text" id="username" name="username" placeholder="请输入用户名" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input type="password" id="password" name="password" placeholder="请输入密码" required />
          </div>
          <button type="submit" className="login-button">登录</button>
        </form>
        <div className="login-footer">
          <a href="/">← 返回博客首页</a>
        </div>
      </div>
    </div>
  )
})

// 处理登录请求
app.post('/admin/login', async (c) => {
  const { username, password } = await c.req.parseBody()
  
  if (username === 'admin123' && password === 'admin123') {
    setCookie(c, 'admin_token', 'admin_authenticated_token_123', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 86400 // 24小时
    })
    return c.redirect('/admin')
  } else {
    return c.render(
      <div className="admin-login-container">
        <div className="login-form-wrapper">
          <div className="login-header">
            <h1>🔐 博客管理后台</h1>
            <p style="color: #ef4444;">用户名或密码错误，请重试</p>
          </div>
          <form className="login-form" action="/admin/login" method="POST">
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input type="text" id="username" name="username" placeholder="请输入用户名" required />
            </div>
            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input type="password" id="password" name="password" placeholder="请输入密码" required />
            </div>
            <button type="submit" className="login-button">登录</button>
          </form>
          <div className="login-footer">
            <a href="/">← 返回博客首页</a>
          </div>
        </div>
      </div>
    )
  }
})

// 管理后台首页
app.get('/admin', async (c) => {
  const { env } = c;
  let blogs: Blog[] = [];
  
  try {
    if (env?.DB) {
      await initDatabase(env.DB);
      const result = await env.DB.prepare(`
        SELECT * FROM blogs ORDER BY created_at DESC
      `).all<Blog>();
      blogs = result.results || [];
    } else {
      blogs = getMockBlogs();
    }
  } catch (error) {
    console.error('Admin blogs fetch error:', error);
    blogs = getMockBlogs();
  }
  
  return c.render(
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-nav">
          <h1>📝 博客管理后台</h1>
          <div className="admin-actions">
            <a href="/admin/new" className="btn btn-primary">+ 写新文章</a>
            <a href="/admin/logout" className="btn btn-secondary">退出登录</a>
          </div>
        </div>
      </header>
      
      <main className="admin-main">
        <div className="admin-stats">
          <div className="stat-card">
            <h3>总文章数</h3>
            <span className="stat-number">{blogs.length}</span>
          </div>
          <div className="stat-card">
            <h3>已发布</h3>
            <span className="stat-number">{blogs.filter(b => b.published === 1).length}</span>
          </div>
          <div className="stat-card">
            <h3>草稿</h3>
            <span className="stat-number">{blogs.filter(b => b.published === 0).length}</span>
          </div>
        </div>
        
        <div className="blog-management">
          <h2>文章管理</h2>
          <div className="blog-table">
            <table>
              <thead>
                <tr>
                  <th>标题</th>
                  <th>作者</th>
                  <th>状态</th>
                  <th>创建时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td>
                      <a href={`/blog/${blog.slug}`} target="_blank">{blog.title}</a>
                    </td>
                    <td>{blog.author}</td>
                    <td>
                      <span className={`status ${blog.published ? 'published' : 'draft'}`}>
                        {blog.published ? '已发布' : '草稿'}
                      </span>
                    </td>
                    <td>{new Date(blog.created_at).toLocaleString('zh-CN')}</td>
                    <td>
                      <div className="action-buttons">
                        <a href={`/admin/edit/${blog.id}`} className="btn-small btn-edit">编辑</a>
                        <a href={`/admin/delete/${blog.id}`} className="btn-small btn-delete" 
                           onclick="return confirm('确定要删除这篇文章吗？')">删除</a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
})

// 退出登录
app.get('/admin/logout', (c) => {
  setCookie(c, 'admin_token', '', { maxAge: 0 })
  return c.redirect('/admin/login')
})

// 新建文章页面
app.get('/admin/new', (c) => {
  return c.render(
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-nav">
          <h1>✍️ 写新文章</h1>
          <div className="admin-actions">
            <a href="/admin" className="btn btn-secondary">← 返回管理</a>
          </div>
        </div>
      </header>
      
      <main className="admin-main">
        <form className="blog-form" action="/admin/create" method="POST">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">文章标题</label>
              <input type="text" id="title" name="title" placeholder="请输入文章标题" required />
            </div>
            <div className="form-group">
              <label htmlFor="slug">文章链接</label>
              <input type="text" id="slug" name="slug" placeholder="article-url-slug" required />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="excerpt">文章摘要</label>
            <textarea id="excerpt" name="excerpt" rows="3" placeholder="请输入文章摘要（可选）"></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">文章内容</label>
            <textarea id="content" name="content" rows="20" placeholder="请输入文章内容" required></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="author">作者</label>
              <input type="text" id="author" name="author" value="Paul" />
            </div>
            <div className="form-group">
              <label htmlFor="published">发布状态</label>
              <select id="published" name="published">
                <option value="0">草稿</option>
                <option value="1">立即发布</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">保存文章</button>
            <a href="/admin" className="btn btn-secondary">取消</a>
          </div>
        </form>
      </main>
    </div>
  )
})

// 创建文章
app.post('/admin/create', async (c) => {
  try {
    const { title, slug, excerpt, content, author, published } = await c.req.parseBody()
    const { env } = c;
    
    if (env?.DB) {
      await initDatabase(env.DB);
      await env.DB.prepare(`
        INSERT INTO blogs (title, slug, excerpt, content, author, published)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(title, slug, excerpt || '', content, author || 'Paul', parseInt(published as string)).run();
    }
    
    return c.redirect('/admin')
  } catch (error) {
    console.error('Create blog error:', error);
    return c.text('创建文章失败: ' + error.message, 500)
  }
})

// 编辑文章页面
app.get('/admin/edit/:id', async (c) => {
  const id = c.req.param('id');
  const { env } = c;
  let blog: Blog | null = null;
  
  try {
    if (env?.DB) {
      await initDatabase(env.DB);
      blog = await env.DB.prepare(`
        SELECT * FROM blogs WHERE id = ?
      `).bind(id).first<Blog>();
    } else {
      blog = getMockBlogs().find(b => b.id === parseInt(id)) || null;
    }
    
    if (!blog) {
      return c.text('文章未找到', 404);
    }
    
    return c.render(
      <div className="admin-container">
        <header className="admin-header">
          <div className="admin-nav">
            <h1>✏️ 编辑文章</h1>
            <div className="admin-actions">
              <a href="/admin" className="btn btn-secondary">← 返回管理</a>
            </div>
          </div>
        </header>
        
        <main className="admin-main">
          <form className="blog-form" action={`/admin/update/${id}`} method="POST">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">文章标题</label>
                <input type="text" id="title" name="title" value={blog.title} required />
              </div>
              <div className="form-group">
                <label htmlFor="slug">文章链接</label>
                <input type="text" id="slug" name="slug" value={blog.slug} required />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="excerpt">文章摘要</label>
              <textarea id="excerpt" name="excerpt" rows="3">{blog.excerpt}</textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="content">文章内容</label>
              <textarea id="content" name="content" rows="20">{blog.content}</textarea>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="author">作者</label>
                <input type="text" id="author" name="author" value={blog.author} />
              </div>
              <div className="form-group">
                <label htmlFor="published">发布状态</label>
                <select id="published" name="published">
                  <option value="0" selected={blog.published === 0 ? true : false}>草稿</option>
                  <option value="1" selected={blog.published === 1 ? true : false}>已发布</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">更新文章</button>
              <a href="/admin" className="btn btn-secondary">取消</a>
            </div>
          </form>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Edit blog fetch error:', error);
    return c.text('获取文章失败', 500);
  }
})

// 更新文章
app.post('/admin/update/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { title, slug, excerpt, content, author, published } = await c.req.parseBody()
    const { env } = c;
    
    if (env?.DB) {
      await env.DB.prepare(`
        UPDATE blogs 
        SET title = ?, slug = ?, excerpt = ?, content = ?, author = ?, published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(title, slug, excerpt || '', content, author || 'Paul', parseInt(published as string), id).run();
    }
    
    return c.redirect('/admin')
  } catch (error) {
    console.error('Update blog error:', error);
    return c.text('更新文章失败: ' + error.message, 500)
  }
})

// 删除文章
app.get('/admin/delete/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { env } = c;
    
    if (env?.DB) {
      await env.DB.prepare(`DELETE FROM blogs WHERE id = ?`).bind(id).run();
    }
    
    return c.redirect('/admin')
  } catch (error) {
    console.error('Delete blog error:', error);
    return c.text('删除文章失败: ' + error.message, 500)
  }
})

export default app