import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from "path" // <--- Import the path module

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', 
  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true
    }),
    react(),
  ],
  // Add this section below to tell Vite how to handle "@"
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});