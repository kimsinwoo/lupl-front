module.exports = {
  apps: [
    {
      name: "myapp-backend",
      script: "backend/server.js",
      cwd: "/root/myapp",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "myapp-frontend",
      script: "npm",
      args: "run dev -- --host 0.0.0.0",
      cwd: "/root/myapp/frontend",
      interpreter: "/bin/bash",
      env: {
        NODE_ENV: "development",
        PORT: 5173,
      },
    },
  ],
};

