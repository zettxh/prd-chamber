module.exports = {
  apps: [{
    name: 'prd-chamber-api',
    script: './server/dist/index.js',
    cwd: '/home/prdchamber/prd-chamber',
    instances: 1,
    max_memory_restart: '600M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    autorestart: true,
    watch: false,
    max_retries: 3,
    retry_delay: 1000,
  }]
}
