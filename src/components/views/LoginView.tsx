'use client';

import { useState } from 'react';
import { useShopStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginView() {
  const { setUser, setView } = useShopStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [showSecretButton, setShowSecretButton] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // БАГ CHARLES: Frontend ВСЕГДА добавляет "!" в конец пароля
      // Ученик должен через Charles перехватить и удалить этот символ
      const buggyPassword = password + '!';
      
      // Скрытый лог для QA (только в консоли разработчика)
      console.log('🔍 [DEBUG] Original password:', password);
      console.log('🔍 [DEBUG] Password sent to server:', buggyPassword);
      console.log('🔍 [DEBUG] Hint: Notice the "!" at the end? Check Charles...');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ПАСХАЛКА POWER RANGERS: По умолчанию отправляем "Green Power Ranger"
          // Если заменить на "Red Power Ranger" - получим права Visor!
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({
          login,
          password: buggyPassword, // Отправляем пароль с "!"
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user, data.token, data.isAdmin);
        
        if (data.message) {
          toast.success(data.message, { duration: 5000 });
        } else {
          toast.success(`Добро пожаловать, ${data.user.login}!`);
        }
      } else {
        toast.error(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  // Проверка секретного слова
  const handleSecretInputChange = (value: string) => {
    setSecretInput(value);
    setShowSecretButton(value.toLowerCase() === 'откройся');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-400 mb-2">🛒 QA Training Shop</h1>
          <p className="text-gray-400">Интернет-магазин товаров</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Вход в систему</CardTitle>
            <CardDescription className="text-gray-400">
              Пора начинать искать баги 🐛
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login" className="text-gray-300">Логин</Label>
                <Input
                  id="login"
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите логин"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isLoading ? '⏳ Вход...' : '🚀 Войти'}
              </Button>
            </form>

            {/* Секретный вход */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="space-y-2">
                <Label htmlFor="secret" className="text-gray-500 text-sm italic">
                  Hsss-ah-sssh-hiss...
                </Label>
                <Input
                  id="secret"
                  type="text"
                  value={secretInput}
                  onChange={(e) => handleSecretInputChange(e.target.value)}
                  placeholder="..."
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-600 focus:border-purple-500"
                />
                
                {showSecretButton && (
                  <Button
                    onClick={() => setView('admin-login')}
                    className="w-full bg-gradient-to-r from-purple-600 to-emerald-600 hover:from-purple-700 hover:to-emerald-700 text-white animate-pulse"
                  >
                    <span className="flex items-center gap-2">
                      <img 
                        src="https://images.unsplash.com/photo-1618944847828-82e943c3bdb7?w=24&h=24&fit=crop&crop=center" 
                        alt="Chamber" 
                        className="w-6 h-6 rounded-full border border-purple-400"
                      />
                      🐍 Тайная комната
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
