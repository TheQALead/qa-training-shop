'use client';

import { useState } from 'react';
import { useShopStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export function AdminLoginView() {
  const { setUser, setView } = useShopStore();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser({
          id: data.admin.id,
          login: data.admin.login,
          role: 'Admin',
          fullName: 'Администратор',
          expertMode: false,
        }, data.token, true);
        toast.success('Добро пожаловать, Администратор!');
      } else {
        toast.error(data.error || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Ошибка соединения');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setView('login')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к входу
        </button>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🔐 Вход для администратора
            </CardTitle>
            <CardDescription className="text-gray-400">
              Панель управления QA Training Shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminLogin" className="text-gray-300">Логин</Label>
                <Input
                  id="adminLogin"
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите логин"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-gray-300">Пароль</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? '⏳ Вход...' : '🔑 Войти в админку'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-gray-500 text-sm text-center">
                Подсказка для тестировщиков: логин <code className="bg-gray-800 px-1 rounded">Makarov</code>, пароль <code className="bg-gray-800 px-1 rounded">QAAdmin</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
