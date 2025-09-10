import type { Quote } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote | null;
  loading: boolean;
  className?: string;
}

export function QuoteCard({ quote, loading, className }: QuoteCardProps) {
  
  if (loading) {
    return (
      <Card className={cn("w-full mx-auto", className)}>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-3 sm:space-y-4 animate-pulse">
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card className={cn("w-full mx-auto", className)}>
        <CardContent className="p-6 sm:p-8 text-center">
          <p className="text-muted-foreground text-sm sm:text-base">명언을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full mx-auto transition-all duration-500 hover:shadow-xl touch-manipulation",
      "bg-gradient-to-br from-white/90 to-blue-50/40 backdrop-blur-md border border-white/30 shadow-lg",
      className
    )}>
      <CardContent className="p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="fade-in space-y-6 sm:space-y-8">
          <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl text-center leading-relaxed sm:leading-relaxed font-semibold text-gray-800 tracking-tight px-2 sm:px-0">
            &ldquo;{quote.message}&rdquo;
          </blockquote>
          
          <footer className="text-center space-y-2 sm:space-y-3 pt-2 sm:pt-4">
            <div className="text-base sm:text-lg text-blue-700/80">
              <div className="font-semibold">{quote.author}</div>
              {quote.authorProfile && (
                <div className="text-xs sm:text-sm opacity-70 mt-1">{quote.authorProfile}</div>
              )}
            </div>
            
            {quote.source === 'fallback' && (
              <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block mt-3 border border-amber-200">
                💾 임시 명언 (네트워크 연결 확인 필요)
              </div>
            )}
          </footer>
        </div>
      </CardContent>
    </Card>
  );
}