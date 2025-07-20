# blog-edge-app

## Project Overview
- **Name**: blog-edge-app
- **Goal**: 构建一个基于Hono框架和Cloudflare Pages的现代化技术博客，展示Web开发技术和分享编程经验
- **Features**: 
  - 响应式博客系统，支持文章列表和详情页面  
  - 完整的管理后台，支持博客增删查改操作
  - 管理员身份验证系统，基于Cookie会话管理
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
  - 1个数据表 (blogs)，包含示例记录和用户创建的内容
  - 本地开发: `.wrangler/state/v3/d1/` 目录下的SQLite文件

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

### 管理后台使用
1. **登录管理后台**
   - 访问 `https://paul-blog-edge-app.pages.dev/admin/login`
   - 用户名: `admin123`，密码: `admin123`

2. **文章管理功能**
   - **查看统计**: 总文章数、已发布数、草稿数
   - **文章列表**: 查看所有文章，支持编辑和删除
   - **写新文章**: 创建新的博客文章
   - **编辑文章**: 修改现有文章内容
   - **发布控制**: 支持草稿/已发布状态切换

3. **管理界面特性**
   - 响应式设计，支持桌面和移动设备
   - 现代化UI，统计卡片和数据表格
   - 状态标识，已发布(绿色)和草稿(橙色)
   - 安全退出，支持会话管理

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

#### 基础环境设置
```bash
# 安装依赖
npm install

# 构建项目
npm run build
```

#### 数据库初始化 (重要!)
本地开发环境需要初始化D1数据库，否则会出现 `no such table: blogs` 错误：

```bash
# 初始化本地D1数据库 (必须执行!)
npx wrangler d1 execute paul-blog-db --local --file=./schema.sql

# 验证数据库初始化成功
npx wrangler d1 execute paul-blog-db --local --command="SELECT COUNT(*) FROM blogs"
```

**注意**: 这个步骤是必需的，只需要执行一次。它会：
- 在 `.wrangler/state/v3/d1/` 创建本地数据库文件
- 执行 `schema.sql` 中的建表语句和索引
- 插入4条示例博客数据
- 建立本地开发环境与D1数据库的连接

#### 启动开发服务器
```bash
# 启动开发服务器 (使用PM2)
pm2 start ecosystem.config.cjs

# 访问本地服务
http://localhost:3000

# 管理后台访问
http://localhost:3000/admin/login
# 用户名: admin123  密码: admin123
```

#### 开发环境管理命令
```bash
# 查看PM2服务状态
pm2 list

# 重启服务
pm2 restart blog-edge-app

# 查看服务日志
pm2 logs blog-edge-app --nostream

# 停止服务
pm2 stop blog-edge-app
```

### Production Deployment
```bash
# 部署到Cloudflare Pages
npx wrangler pages deploy dist --project-name paul-blog-edge-app

# 生产环境数据库操作
npx wrangler d1 execute paul-blog-db --file=schema.sql --remote
```

## 常见问题解决

### Q1: 管理后台创建文章时报错 "no such table: blogs"
**解决方案**: 本地开发环境需要初始化D1数据库
```bash
npx wrangler d1 execute paul-blog-db --local --file=./schema.sql
```

### Q2: 本地访问 /admin 重定向到登录页
**原因**: 管理后台需要身份验证  
**解决方案**: 
1. 访问 `/admin/login`
2. 用户名: `admin123`，密码: `admin123`
3. 登录后会自动跳转到管理后台

### Q3: PM2服务启动失败
**解决方案**: 先清理端口再重启
```bash
# 清理3000端口
fuser -k 3000/tcp 2>/dev/null || true

# 重新启动服务
pm2 restart blog-edge-app
```

### Q4: 本地数据库数据丢失
**原因**: `.wrangler/` 目录被删除  
**解决方案**: 重新初始化本地数据库
```bash
npx wrangler d1 execute paul-blog-db --local --file=./schema.sql
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