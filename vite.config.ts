import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 기본을 상대경로로 두어 다양한 호스팅에서 안전하게 동작하도록 설정합니다.
// 리포지토리 페이지 전용으로 배포하려면 base: '/bohyesa/' 로 변경하세요.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    open: true
  }
});