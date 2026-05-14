import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1_400,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "phaser",
              test: /node_modules[\\/]phaser/,
              priority: 2,
              maxSize: 450_000,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 1,
              maxSize: 450_000,
            },
          ],
        },
      },
    },
  },
});
