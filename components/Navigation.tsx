'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Home } from 'lucide-react';
import { cn, isFutureDate, isBeforeMinDate, isToday, formatDate } from '@/lib/utils';

interface NavigationProps {
  currentDate: Date;
  className?: string;
}

export function Navigation({ currentDate, className }: NavigationProps) {
  const router = useRouter();

  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    
    // Don't allow dates before 2025-09-01
    if (!isBeforeMinDate(prevDate)) {
      router.push(`/?date=${formatDate(prevDate)}`);
    }
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Don't allow future dates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (nextDate <= today) {
      router.push(`/?date=${formatDate(nextDate)}`);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    const minDate = new Date('2025-09-01');
    
    // If today is before min date, go to min date instead
    if (today < minDate) {
      router.push(`/?date=${formatDate(minDate)}`);
    } else {
      router.push('/');
    }
  };

  const canGoNext = (() => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return nextDate <= today;
  })();
  
  const canGoPrev = (() => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    return !isBeforeMinDate(prevDate);
  })();
  
  const showTodayButton = !isToday(currentDate);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl mx-auto gap-4 sm:gap-0", className)}>
      {/* Mobile: Date display on top */}
      <div className="flex items-center justify-between w-full sm:hidden">
        <Button
          variant="outline"
          size="default"
          onClick={handlePrevDay}
          disabled={!canGoPrev}
          className={cn(
            "slide-in shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0",
            !canGoPrev && "opacity-50 cursor-not-allowed"
          )}
          style={{ animationDelay: '0.1s' }}
          aria-label="이전 날짜"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg mx-3 flex-1 justify-center">
          <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="font-semibold text-sm text-center">
            {currentDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
        </div>

        <Button
          variant="outline"
          size="default"
          onClick={handleNextDay}
          disabled={!canGoNext}
          className={cn(
            "slide-in shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0",
            !canGoNext && "opacity-50 cursor-not-allowed"
          )}
          style={{ animationDelay: '0.2s' }}
          aria-label="다음 날짜"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile: Today button below */}
      {showTodayButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTodayClick}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 sm:hidden"
          aria-label="오늘로 이동"
        >
          <Home className="h-4 w-4 mr-2" />
          오늘
        </Button>
      )}

      {/* Desktop: Original layout */}
      <Button
        variant="outline"
        size="lg"
        onClick={handlePrevDay}
        disabled={!canGoPrev}
        className={cn(
          "hidden sm:flex slide-in shadow-sm hover:shadow-md transition-all duration-200",
          !canGoPrev && "opacity-50 cursor-not-allowed"
        )}
        style={{ animationDelay: '0.1s' }}
        aria-label="이전 날짜"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="hidden sm:flex items-center gap-4">
        <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-lg">
            {currentDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short'
            })}
          </span>
        </div>

        {showTodayButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTodayClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            aria-label="오늘로 이동"
          >
            <Home className="h-4 w-4 mr-2" />
            오늘
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="lg"
        onClick={handleNextDay}
        disabled={!canGoNext}
        className={cn(
          "hidden sm:flex slide-in shadow-sm hover:shadow-md transition-all duration-200",
          !canGoNext && "opacity-50 cursor-not-allowed"
        )}
        style={{ animationDelay: '0.2s' }}
        aria-label="다음 날짜"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}