-- 博客数据库表结构
-- Cloudflare D1 Database Schema

-- 创建博客表
CREATE TABLE IF NOT EXISTS blogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author TEXT DEFAULT 'Paul',
  slug TEXT UNIQUE NOT NULL,
  published INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at);

-- 插入示例博客数据
INSERT OR IGNORE INTO blogs (title, content, excerpt, slug, published) VALUES 
(
  '欢迎来到我的博客',
  '# 欢迎来到我的技术博客

这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。

## 关于我
我是一个热爱技术的程序员，专注于现代Web开发技术栈。

## 技术栈
- **前端**: JavaScript, HTML5, CSS3, TailwindCSS
- **后端**: Hono.js, Node.js
- **云服务**: Cloudflare Workers, Cloudflare Pages
- **数据库**: D1 SQLite

## 博客目标
通过这个博客，我希望能够：
1. 记录技术学习过程
2. 分享实用的开发经验
3. 探讨前沿技术趋势
4. 与其他开发者交流

欢迎大家关注我的博客，一起学习进步！',
  '这是我的第一篇博客文章，主要记录我在Web开发和技术学习过程中的心得体会。',
  'welcome-to-my-blog',
  1
),
(
  'Hono框架深度解析',
  '# Hono框架深度解析

Hono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。

## 为什么选择Hono？

### 1. 极速性能
- 比Express.js快10倍以上
- 专门为Cloudflare Workers优化
- 零冷启动时间

### 2. 现代化API设计
```typescript
import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) => {
  return c.json({ message: "Hello Hono!" })
})
```

### 3. 丰富的中间件生态
- JWT认证
- CORS支持
- 请求验证
- 静态文件服务

## 实际应用场景
- API服务开发
- 全栈应用构建
- 边缘计算应用
- 微服务架构

Hono真的是现代Web开发的利器！',
  'Hono是一个轻量级、快速、现代的Web框架，专为边缘计算环境设计。',
  'hono-framework-deep-dive',
  1
),
(
  'Cloudflare Pages最佳实践',
  '# Cloudflare Pages最佳实践

作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。

## 核心优势

### 🚀 全球边缘网络
- 200+国家数据中心
- 毫秒级响应时间
- 自动CDN加速

### 💰 成本效益
- 免费额度足够个人项目
- 按需付费，无隐藏费用

### 🔧 开发体验
- Git集成部署
- 预览环境支持
- 自动SSL证书

## 部署最佳实践

### 1. 项目结构优化
确保构建输出目录正确配置：
```json
{
  "build": {
    "outDir": "dist"
  }
}
```

### 2. 环境变量管理
- 开发环境使用 `.dev.vars`
- 生产环境使用 `wrangler secret`

### 3. 缓存策略
合理配置缓存头，提升加载速度。

## 与其他平台对比
相比于Vercel、Netlify等平台，Cloudflare Pages在全球访问速度和成本控制方面都有明显优势。

推荐所有前端开发者都试试Cloudflare Pages！',
  '作为现代Web开发者，选择合适的部署平台至关重要。Cloudflare Pages是我目前最推荐的选择。',
  'cloudflare-pages-best-practices',
  1
),
(
  'TypeScript开发技巧分享',
  '# TypeScript开发技巧分享

TypeScript已经成为现代JavaScript开发的标准。以下是我在实际项目中总结的一些实用技巧。

## 类型安全最佳实践

### 1. 严格类型检查
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true
  }
}
```

### 2. 接口定义规范
```typescript
interface User {
  readonly id: number;
  name: string;
  email?: string;
}
```

### 3. 泛型的妙用
```typescript
function apiCall<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json())
}
```

## 实用类型工具

### 内置实用类型
- `Partial<T>` - 所有属性可选
- `Required<T>` - 所有属性必需
- `Pick<T, K>` - 选择特定属性
- `Omit<T, K>` - 排除特定属性

### 自定义类型守卫
```typescript
function isString(value: unknown): value is string {
  return typeof value === "string"
}
```

## 开发工具配置
- VSCode + TypeScript插件
- ESLint + TypeScript规则
- Prettier代码格式化

TypeScript让JavaScript开发更加可靠和高效！',
  'TypeScript已经成为现代JavaScript开发的标准。以下是我在实际项目中总结的一些实用技巧。',
  'typescript-development-tips',
  1
);