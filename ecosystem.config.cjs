module.exports = {
  apps: [
    {
      name: 'prd-chamber-api',
      script: './server/dist/index.js',
      cwd: '/home/ubuntu/prd-chamber',
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
    },
    {
      name: 'prd-chamber',
      script: './start-frontend.sh',
      cwd: '/home/ubuntu/prd-chamber',
      instances: 1,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      watch: false,
    }
  ]
};
