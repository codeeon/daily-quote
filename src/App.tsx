import React, { useState, useCallback, useEffect } from 'react';
import { QuoteCard } from '@/components/QuoteCard';
import { Navigation } from '@/components/Navigation';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { Settings } from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';
import { useQuote } from '@/hooks/useQuote';
import { useSettings } from '@/hooks/useLocalStorage';

function App() {
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
  }, [quote]);

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
        <main className='fade-in' style={{ animationDelay: '0.2s' } as React.CSSProperties}>
          {error ? (
            <ErrorDisplay error={error} onRetry={retry} />
          ) : (
            <QuoteCard quote={quote} loading={loading} onShare={handleShare} />
          )}
        </main>

        {/* Footer */}
        <footer
          className='text-center text-xs text-muted-foreground fade-in'
          style={{ animationDelay: '0.4s' } as React.CSSProperties}
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
  );
}

export default App;
