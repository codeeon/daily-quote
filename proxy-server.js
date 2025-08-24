const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS 설정
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Korean Advice API 프록시
app.use('/api/advice', createProxyMiddleware({
  target: 'https://korean-advice-open-api.vercel.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api/advice': '/api/advice'
  },
  onError: (err, req, res) => {
    console.error('프록시 오류:', err.message);
    res.status(500).json({
      message: "프록시 서버 오류가 발생했습니다.",
      author: "시스템",
      authorProfile: "에러",
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
}));

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📡 Korean Advice API 프록시: http://localhost:${PORT}/api/advice`);
});