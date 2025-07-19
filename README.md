# blog-edge-app

## Project Overview
- **Name**: blog-edge-app
- **Goal**: 构建一个基于Hono框架和Cloudflare Pages的现代化技术博客，展示Web开发技术和分享编程经验
- **Features**: 
  - 响应式博客系统，支持文章列表和详情页面
  - RESTful API接口，提供博客数据访问
  - Cloudflare D1数据库集成，支持数据持久化
  - 现代化UI设计，使用TailwindCSS和自定义样式
  - 全球边缘部署，毫秒级响应速度

## URLs
- **Production**: https://paul-blog-edge-app.pages.dev
- **GitHub**: https://github.com/wwwppp0801/my-hello-world
- **API Endpoint**: https://paul-blog-edge-app.pages.dev/api/blogs
- **Sample Blog**: https://paul-blog-edge-app.pages.dev/blog/welcome-to-my-blog

## Data Architecture
- **Data Models**: 
  - `Blog` - 博客文章模型 (id, title, content, excerpt, author, slug, published, created_at, updated_at)
  - `ApiResponse<T>` - API响应标准格式
  - `Env` - Cloudflare环境绑定类型

- **Storage Services**: 
  - Cloudflare D1 Database (paul-blog-db) - 主要数据存储
  - 数据库ID: d6e923f8-b208-416b-b70b-1c458a0e5849
  - 1个数据表 (blogs)，4条示例记录

- **Data Flow**: 
  1. 用户访问博客 → Hono路由处理
  2. 查询D1数据库 → 获取博客数据
  3. 渲染HTML页面 → 返回给用户
  4. API请求 → JSON格式返回数据
  5. 开发环境降级 → 使用模拟数据

## User Guide

### 访问博客
1. 访问主页 https://paul-blog-edge-app.pages.dev 查看博客列表
2. 点击文章标题或"阅读全文"按钮查看完整文章
3. 使用API接口 `/api/blogs` 获取JSON格式的博客数据
4. 访问 `/about` 了解技术栈和项目信息

### 示例内容
博客包含4篇示例技术文章：
- 欢迎来到我的博客 - 博客介绍和个人背景
- Hono框架深度解析 - Web框架特性和性能分析
- Cloudflare Pages最佳实践 - 部署优化和配置技巧
- TypeScript开发技巧分享 - 类型系统和实战经验

### API使用
```bash
# 获取所有博客文章
curl https://paul-blog-edge-app.pages.dev/api/blogs

# 健康检查
curl https://paul-blog-edge-app.pages.dev/api/hello
```

## Deployment
- **Platform**: Cloudflare Pages
- **Status**: ✅ Active
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare D1
- **Project Name**: paul-blog-edge-app
- **Last Updated**: 2025-07-19
- **Build Output**: dist/ directory
- **Database**: Cloudflare D1 (paul-blog-db)

### Development Environment
```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动开发服务器 (使用PM2)
pm2 start ecosystem.config.cjs

# 访问本地服务
http://localhost:3000
```

### Production Deployment
```bash
# 部署到Cloudflare Pages
npx wrangler pages deploy dist --project-name paul-blog-edge-app

# 数据库操作
npx wrangler d1 execute paul-blog-db --file=schema.sql --remote
```

## Technical Details

### File Structure
```
blog-edge-app/
├── src/
│   ├── index.tsx          # 主应用文件 (路由和业务逻辑)
│   ├── renderer.tsx       # JSX渲染器配置
│   └── types.ts          # TypeScript类型定义
├── public/static/
│   └── style.css         # 自定义CSS样式
├── dist/                 # 构建输出目录
├── schema.sql           # 数据库表结构和示例数据
├── wrangler.toml        # Cloudflare配置
└── ecosystem.config.cjs # PM2开发环境配置
```

### Database Schema
```sql
CREATE TABLE blogs (
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
```

### Performance Features
- 全球边缘计算部署 (200+数据中心)
- 零冷启动时间 (Hono框架优化)
- 自动CDN加速和缓存
- 响应式设计，移动端优化
- TypeScript类型安全开发

---

**作者**: Paul (wwwppp0801@gmail.com)  
**项目类型**: 技术博客 / Web开发实践  
**开发时间**: 2025年7月  
**许可证**: MIT License