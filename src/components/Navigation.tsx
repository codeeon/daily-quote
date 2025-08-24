import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Home } from 'lucide-react';
import { cn, isFutureDate, isToday } from '@/lib/utils';

interface NavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onTodayClick: () => void;
  className?: string;
}

export function Navigation({ 
  currentDate, 
  onDateChange, 
  onTodayClick, 
  className 
}: NavigationProps) {
  const handlePrevDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    onDateChange(prevDate);
  };

  const handleNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Don't allow future dates
    if (!isFutureDate(nextDate)) {
      onDateChange(nextDate);
    }
  };

  const canGoNext = !isFutureDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000));
  const showTodayButton = !isToday(currentDate);

  return (
    <div className={cn("flex items-center justify-between w-full max-w-2xl mx-auto", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevDay}
        className="slide-in"
        style={{ animationDelay: '0.1s' }}
        aria-label="이전 날짜"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">
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
            onClick={onTodayClick}
            className="text-xs"
            aria-label="오늘로 이동"
          >
            <Home className="h-3 w-3 mr-1" />
            오늘
          </Button>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextDay}
        disabled={!canGoNext}
        className={cn(
          "slide-in",
          !canGoNext && "opacity-50 cursor-not-allowed"
        )}
        style={{ animationDelay: '0.2s' }}
        aria-label="다음 날짜"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}