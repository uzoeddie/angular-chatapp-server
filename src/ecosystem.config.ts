module.exports = {
  apps: [
    {
      name: 'chatapp-server',
      exec_mode: 'cluster',
      instances: 'MAX',
      script: './build/app.js',
      autorestart: true,
      watch: true,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
