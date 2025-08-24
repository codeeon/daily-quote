import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy, options) => {
          // 로컬 API 서버가 없을 경우 fallback
          proxy.on('error', (err, req, res) => {
            console.warn('프록시 서버 연결 실패, fallback 응답 제공');
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
              message: "로컬 개발 중입니다. 서버를 배포하면 실제 API가 작동합니다.",
              author: "개발 모드",
              authorProfile: "로컬 환경",
              fallback: true,
              timestamp: new Date().toISOString()
            }));
          });
        }
      }
    }
  }
})
