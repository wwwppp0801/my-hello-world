// 博客数据类型定义
export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  slug: string;
  published: number; // SQLite中的布尔值用整数表示
  created_at: string;
  updated_at: string;
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Cloudflare Bindings类型
export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
}