# 🌟 Paul的技术博客

一个基于Hono框架和Cloudflare Pages构建的现代化博客网站。

## ✨ 特性

- 🚀 **极速性能** - 基于Hono框架的轻量级架构
- 🌍 **全球部署** - 利用Cloudflare Pages的边缘网络
- 💾 **数据库支持** - 集成Cloudflare D1 SQLite数据库
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🎨 **现代UI** - 使用TailwindCSS和自定义样式
- 🔧 **TypeScript** - 类型安全的开发体验

## 🏗️ 技术栈

- **框架**: [Hono.js](https://hono.dev/) - 超快的Web框架
- **运行时**: [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算
- **部署**: [Cloudflare Pages](https://pages.cloudflare.com/) - 静态站点托管
- **数据库**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - 分布式SQLite
- **样式**: [TailwindCSS](https://tailwindcss.com/) - 实用优先的CSS框架
- **语言**: [TypeScript](https://www.typescriptlang.org/) - 类型安全的JavaScript
- **构建工具**: [Vite](https://vitejs.dev/) - 现代前端构建工具

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
# 构建项目
npm run build

# 启动开发服务器
npm run preview
```

### 生产部署
```bash
# 构建并部署到Cloudflare Pages
npm run deploy
```

## 📁 项目结构

```
hello-world-app/
├── src/
│   ├── index.tsx          # 主应用文件
│   ├── renderer.tsx       # JSX渲染器
│   └── types.ts          # TypeScript类型定义
├── public/
│   └── static/
│       └── style.css     # 自定义样式
├── dist/                 # 构建输出目录
├── schema.sql           # 数据库结构
├── wrangler.jsonc       # Cloudflare配置
├── vite.config.ts       # Vite配置
└── ecosystem.config.cjs # PM2配置
```

## 🎯 功能特点

### 📝 博客系统
- 博客文章列表显示
- 单个文章详情页面
- 响应式博客卡片设计
- 自动生成文章摘要

### 🔗 API接口
- `GET /api/blogs` - 获取博客列表
- `GET /blog/:slug` - 获取单个博客文章
- `GET /api/hello` - 测试API接口

### 💾 数据库
- 自动初始化数据库表结构
- 示例博客数据自动插入
- 开发环境模拟数据支持
- 生产环境D1数据库集成

## 🌐 在线访问

- **主页**: [博客首页](https://your-domain.pages.dev)
- **博客API**: [/api/blogs](https://your-domain.pages.dev/api/blogs)
- **关于页面**: [/about](https://your-domain.pages.dev/about)

## 📊 示例博客文章

1. **欢迎来到我的博客** - 博客介绍和技术栈概述
2. **Hono框架深度解析** - 详细介绍Hono框架特性
3. **Cloudflare Pages最佳实践** - 部署和优化技巧
4. **TypeScript开发技巧分享** - 实用的开发经验

## 🔧 开发配置

### 环境变量
```bash
# .dev.vars (开发环境)
ENVIRONMENT=development

# 生产环境变量通过wrangler设置
# wrangler secret put ENVIRONMENT
```

### 数据库配置
```sql
-- schema.sql
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

## 🎨 样式定制

项目使用TailwindCSS作为基础样式框架，并通过`/public/static/style.css`添加自定义样式：

- 渐变背景和卡片效果
- 响应式博客卡片布局
- 悬停动画和过渡效果
- 移动端优化样式

## 📱 响应式设计

- **桌面端**: 网格布局，多列显示
- **移动端**: 单列布局，触摸优化
- **平板端**: 自适应布局

## 🚀 性能优化

- 边缘计算部署，全球低延迟
- 静态资源CDN加速
- 轻量级框架，快速启动
- 服务器端渲染(SSR)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issues和Pull Requests！

## 📧 联系方式

- **作者**: Paul
- **邮箱**: wwwppp0801@gmail.com
- **GitHub**: [@wwwppp0801](https://github.com/wwwppp0801)

---

⭐ 如果这个项目对你有帮助，请给它一个Star！