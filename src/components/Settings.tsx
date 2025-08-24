import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Sun, Moon, Trash2 } from 'lucide-react';
import { useSettings } from '@/hooks/useLocalStorage';
import { ApiService } from '@/services/api';
import { cn } from '@/lib/utils';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const apiService = new ApiService();

export function Settings({ isOpen, onClose, className }: SettingsProps) {
  const {
    fontSize,
    setFontSize,
    darkMode,
    setDarkMode,
    favorites,
    setFavorites,
  } = useSettings();

  const handleClearCache = () => {
    apiService.clearCache();
    alert('캐시가 성공적으로 삭제되었습니다.');
  };

  const handleClearFavorites = () => {
    if (window.confirm('모든 즐겨찾기를 삭제하시겠습니까?')) {
      setFavorites([]);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode class on component mount
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            설정
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">테마</h4>
            <Button
              variant={darkMode ? "default" : "outline"}
              size="sm"
              onClick={toggleDarkMode}
              className="w-full justify-start"
            >
              {darkMode ? <Moon className="h-4 w-4 mr-2" /> : <Sun className="h-4 w-4 mr-2" />}
              {darkMode ? "다크 모드" : "라이트 모드"}
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">글꼴 크기</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={fontSize === 'small' ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize('small')}
              >
                작게
              </Button>
              <Button
                variant={fontSize === 'medium' ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize('medium')}
              >
                보통
              </Button>
              <Button
                variant={fontSize === 'large' ? "default" : "outline"}
                size="sm"
                onClick={() => setFontSize('large')}
              >
                크게
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">데이터 관리</h4>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                즐겨찾기: {favorites.length}개
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFavorites}
                  className="flex-1"
                  disabled={favorites.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  즐겨찾기 삭제
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCache}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  캐시 삭제
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}