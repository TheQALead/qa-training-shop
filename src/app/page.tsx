'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShopStore } from '@/lib/store';
import { LoginView } from '@/components/views/LoginView';
import { ShopView } from '@/components/views/ShopView';
import { ProfileView } from '@/components/views/ProfileView';
import { AdminLoginView } from '@/components/views/AdminLoginView';
import { AdminView } from '@/components/views/AdminView';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Инициализация базы данных
async function initDatabase() {
  try {
    const res = await fetch('/api/init');
    const data = await res.json();
    console.log('Init result:', data);
  } catch (error) {
    console.error('Init error:', error);
  }
}

// Получение настроек
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    useShopStore.getState().setPopupDuration(data.popupDuration || 1);
  } catch (error) {
    console.error('Settings error:', error);
  }
}

export default function QATrainingShop() {
  const { currentView, isAuthenticated, token, isAdmin, setView, logout, popupDuration } = useShopStore();
  const [isLoading, setIsLoading] = useState(true);

  // Инициализация при загрузке
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await fetchSettings();
      setIsLoading(false);
    };
    init();
  }, []);

  // Показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Загрузка QA Training Shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      {/* Header */}
      {isAuthenticated && (
        <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 
                className="text-xl font-bold text-emerald-400 cursor-pointer hover:text-emerald-300"
                onClick={() => setView(isAdmin ? 'admin' : 'shop')}
              >
                🛒 QA Training Shop
              </h1>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">
                {isAdmin ? '🔑 Admin' : (useShopStore.getState().user?.role === 'Visor' ? '👁 Visor' : '📚 Student')}
              </span>
            </div>
            
            <nav className="flex items-center gap-3">
              {!isAdmin && (
                <>
                  <button
                    onClick={() => setView('shop')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'shop' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    🏪 Магазин
                  </button>
                  <button
                    onClick={() => setView('profile')}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentView === 'profile' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    👤 Мои данные
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  logout();
                  toast.info('Вы вышли из системы');
                }}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
              >
                🚪 Выход
              </button>
            </nav>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {currentView === 'login' && <LoginView />}
        {currentView === 'shop' && <ShopView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'admin-login' && <AdminLoginView />}
        {currentView === 'admin' && <AdminView />}
      </main>

      {/* Footer */}
      {isAuthenticated && (
        <footer className="bg-gray-900 border-t border-gray-800 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
            <p>🎓 QA Training Shop — Тренировочный полигон для QA-инженеров</p>
            <p className="text-xs mt-1">Найдите все спрятанные баги! 🐛</p>
          </div>
        </footer>
      )}
    </div>
  );
}
