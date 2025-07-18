// PM2 生态系统配置文件 (CommonJS 格式)
module.exports = {
  apps: [
    {
      name: 'blog-edge-app',
      script: 'npx',
      args: 'wrangler pages dev dist --ip 0.0.0.0 --port 3000',
      cwd: '/home/user/blog-edge-app',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false, // 禁用PM2文件监控（Wrangler自带热重载）
      instances: 1, // 开发模式只使用一个实例
      exec_mode: 'fork',
      restart_delay: 3000, // 重启延迟3秒
      max_restarts: 10, // 最多重启10次
      min_uptime: '10s', // 最小运行时间
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
}