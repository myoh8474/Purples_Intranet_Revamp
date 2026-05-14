import { resolve } from 'path';
import { readdirSync, statSync, existsSync } from 'fs';

/**
 * pages/ 디렉토리를 재귀 탐색하여 모든 HTML 파일을 찾아 MPA 입력점으로 등록
 * → 새 페이지를 추가할 때 이 파일을 수정할 필요 없음
 */
function findHtmlEntries(dir, entries = {}) {
  if (!existsSync(dir)) return entries;
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = resolve(dir, item);
    if (statSync(fullPath).isDirectory()) {
      findHtmlEntries(fullPath, entries);
    } else if (item.endsWith('.html')) {
      // 키: 상대 경로에서 .html 제거 → "pages/associate/list"
      const key = fullPath
        .replace(resolve(__dirname) + '\\', '')
        .replace(resolve(__dirname) + '/', '')
        .replace(/\.html$/, '')
        .replace(/\\/g, '/');
      entries[key] = fullPath;
    }
  }
  return entries;
}

export default {
  // 루트를 프로젝트 최상위로 설정
  root: '.',

  // 개발 서버 설정
  server: {
    port: 3000,
    open: true,           // 실행 시 자동으로 브라우저 열기
    cors: true,
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // 메인 페이지
        main: resolve(__dirname, 'index.html'),
        // pages/ 하위 모든 HTML 자동 탐색
        ...findHtmlEntries(resolve(__dirname, 'pages')),
      },
    },
  },

  // 경로 별칭
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@core': resolve(__dirname, 'src/core'),
      '@config': resolve(__dirname, 'src/config'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@mock': resolve(__dirname, 'src/mock'),
    },
  },
};
