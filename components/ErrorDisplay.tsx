import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react';
import type { AppError } from '@/types';
import { ErrorType } from '@/types';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ error, onRetry, className }: ErrorDisplayProps) {
  const getErrorIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return <Wifi className="h-8 w-8 text-orange-500" />;
      case ErrorType.RATE_LIMIT:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '네트워크 연결 오류';
      case ErrorType.RATE_LIMIT:
        return '요청 한도 초과';
      case ErrorType.API_UNAVAILABLE:
        return '서비스 일시 중단';
      case ErrorType.INVALID_RESPONSE:
        return '데이터 오류';
      default:
        return '오류 발생';
    }
  };

  const getErrorDescription = () => {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        return '인터넷 연결을 확인하고 다시 시도해주세요.';
      case ErrorType.RATE_LIMIT:
        return '잠시 후에 다시 시도해주세요.';
      case ErrorType.API_UNAVAILABLE:
        return '서비스가 일시적으로 중단되었습니다.';
      case ErrorType.INVALID_RESPONSE:
        return '데이터를 올바르게 받아오지 못했습니다.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardContent className="p-8">
        <div className="text-center space-y-4 fade-in">
          <div className="flex justify-center">
            {getErrorIcon()}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {getErrorTitle()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {error.message || getErrorDescription()}
            </p>
          </div>

          {error.retryable && onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="mt-4"
              aria-label="다시 시도"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            대체 명언이 표시되었습니다.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}