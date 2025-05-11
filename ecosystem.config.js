module.exports = {
  apps: [
    {
      name: "ecomerce-app", // Change to your app name
      script: "./app.js", // Or server.js or index.js — your actual entry file
      instances: 1, // Keep it single instance to save RAM on 1GB EC2
      autorestart: true,
      watch: false,
      max_memory_restart: "300M", // Restarts if memory usage exceeds 300MB
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
