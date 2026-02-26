// PM2 Ecosystem Konfiguration für ReWear Southside
// Start mit: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'rewear-api',
      script: 'index.js',
      cwd: '/var/www/rewear/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/rewear-error.log',
      out_file: '/var/log/pm2/rewear-out.log',
      log_file: '/var/log/pm2/rewear-combined.log',
      time: true
    }
  ]
};
