module.exports = {
  apps: [
    {
      name: 'hyro-website',
      script: 'npm',
      args: 'start',
      cwd: '/root/hyro/website',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Logging
      error_file: '/root/hyro/website/logs/pm2-error.log',
      out_file: '/root/hyro/website/logs/pm2-out.log',
      log_file: '/root/hyro/website/logs/pm2-combined.log',
      time: true,
      // Auto restart
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      // Process management
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      // Merge logs
      merge_logs: true,
    },
  ],
};

