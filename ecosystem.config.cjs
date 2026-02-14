/**
 * PM2 ecosystem config для voshod-web (Next.js)
 * Запуск: pm2 start ecosystem.config.cjs
 */

module.exports = {
  apps: [
    {
      name: "voshod-web",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
