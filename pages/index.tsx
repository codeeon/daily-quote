import { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import { QuoteCard } from '@/components/QuoteCard';
import { Navigation } from '@/components/Navigation';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Settings } from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { useQuote } from '@/hooks/useQuote';
import { useSettings } from '@/hooks/useLocalStorage';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { darkMode } = useSettings();
  
  const { quote, loading, error, retry } = useQuote(currentDate);

  // Apply dark mode on app initialization
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  const handleTodayClick = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleCopyToClipboard = useCallback(() => {
    if (!quote) return;

    const text = `"${quote.message}" - ${quote.author}\n\n매일의 명언에서 보기: ${window.location.href}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert('클립보드에 복사되었습니다!');
        })
        .catch(() => {
          // Fallback for older browsers
          fallbackCopyTextToClipboard(text);
        });
    } else {
      fallbackCopyTextToClipboard(text);
    }
  }, [quote]);

  const handleShare = useCallback(() => {
    if (!quote) return;

    const shareData = {
      title: '매일의 명언',
      text: `"${quote.message}" - ${quote.author}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).catch(() => {
        // Fallback to clipboard
        handleCopyToClipboard();
      });
    } else {
      handleCopyToClipboard();
    }
  }, [quote, handleCopyToClipboard]);

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert('클립보드에 복사되었습니다!');
      } else {
        alert('복사에 실패했습니다. 수동으로 복사해주세요.');
      }
    } catch (err) {
      alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    } finally {
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <Head>
        <title>매일의 명언 - 오늘의 한국어 명언</title>
        <meta name="description" content="매일 새로운 한국어 명언과 지혜를 만나보세요. 과거의 명언은 일관되게 보존되며, 다양한 테마의 명언을 제공합니다." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph */}
        <meta property="og:title" content="매일의 명언 - 오늘의 한국어 명언" />
        <meta property="og:description" content="매일 새로운 한국어 명언과 지혜를 만나보세요. 과거의 명언은 일관되게 보존되며, 다양한 테마의 명언을 제공합니다." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ko_KR" />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="매일의 명언" />
        
        {/* Preconnect */}
        <link rel="preconnect" href="https://korean-advice-open-api.vercel.app" />
      </Head>

      <div className='min-h-screen transition-colors duration-300 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'>
        <div className='container mx-auto px-4 py-8 space-y-8'>
          {/* Header */}
          <header className='text-center space-y-4'>
            <div className='fade-in'>
              <h1 className='text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                매일의 명언
              </h1>
              <p className='text-muted-foreground mt-2'>매일 새로운 지혜와 영감을 만나보세요</p>
            </div>

            <div className='flex justify-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => setShowSettings(true)}
                className='slide-in'
                style={{ animationDelay: '0.3s' }}
                aria-label='설정'
              >
                <SettingsIcon className='h-4 w-4' />
              </Button>
            </div>
          </header>

          {/* Navigation */}
          <Navigation
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onTodayClick={handleTodayClick}
            className='slide-in'
          />

          {/* Main Content */}
          <main className='fade-in' style={{ animationDelay: '0.2s' }}>
            {error ? (
              <ErrorDisplay error={error} onRetry={retry} />
            ) : (
              <QuoteCard quote={quote} loading={loading} onShare={handleShare} />
            )}
          </main>

          {/* Footer */}
          <footer
            className='text-center text-xs text-muted-foreground fade-in'
            style={{ animationDelay: '0.4s' }}
          >
            <p>
              Powered by{' '}
              <a
                href='https://korean-advice-open-api.vercel.app'
                target='_blank'
                rel='noopener noreferrer'
                className='underline hover:text-primary'
              >
                Korean Advice Open API
              </a>
            </p>
          </footer>
        </div>

        {/* Settings Modal */}
        <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      </div>
    </>
  );
}