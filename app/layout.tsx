import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '매일의 명언 - 오늘의 한국어 명언',
  description: '매일 새로운 한국어 명언과 지혜를 만나보세요. 과거의 명언은 일관되게 보존되며, 다양한 테마의 명언을 제공합니다.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: '매일의 명언 - 오늘의 한국어 명언',
    description: '매일 새로운 한국어 명언과 지혜를 만나보세요. 과거의 명언은 일관되게 보존되며, 다양한 테마의 명언을 제공합니다.',
    type: 'website',
    locale: 'ko_KR',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '매일의 명언',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': '매일의 명언',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#667eea',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://korean-advice-open-api.vercel.app" />
      </head>
      <body>{children}</body>
    </html>
  );
}