import type { Quote } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/useLocalStorage';

interface QuoteCardProps {
  quote: Quote | null;
  loading: boolean;
  onShare?: () => void;
  className?: string;
}

export function QuoteCard({ quote, loading, onShare, className }: QuoteCardProps) {
  const { fontSize, isFavorite, toggleFavorite } = useSettings();
  
  if (loading) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quote) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">명언을 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  const isQuoteFavorite = quote.date ? isFavorite(quote.date) : false;

  const handleToggleFavorite = () => {
    if (quote.date) {
      toggleFavorite(quote.date);
    }
  };

  const getFontSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'text-lg md:text-xl';
      case 'large':
        return 'text-2xl md:text-3xl';
      default:
        return 'text-xl md:text-2xl';
    }
  };

  return (
    <Card className={cn(
      "w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-lg",
      "bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm",
      "dark:from-gray-800/80 dark:to-gray-900/80",
      className
    )}>
      <CardContent className="p-8">
        <div className="fade-in space-y-6">
          <blockquote className={cn(
            "text-center leading-relaxed font-medium text-gray-800 dark:text-gray-100",
            getFontSizeClass(fontSize)
          )}>
            "{quote.message}"
          </blockquote>
          
          <footer className="text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              <div className="font-medium">{quote.author}</div>
              {quote.authorProfile && (
                <div className="text-xs opacity-75">{quote.authorProfile}</div>
              )}
            </div>
          </footer>

          <div className="flex justify-center gap-2">
            {quote.date && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className={cn(
                  "transition-colors",
                  isQuoteFavorite && "text-red-500 hover:text-red-600"
                )}
                aria-label={isQuoteFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              >
                <Heart 
                  className={cn(
                    "h-4 w-4",
                    isQuoteFavorite && "fill-current"
                  )} 
                />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onShare}
              aria-label="공유하기"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}