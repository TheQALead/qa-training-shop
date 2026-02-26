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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Trash2, Plus, Minus, Package, X } from 'lucide-react';

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

// Форматирование цены
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function QATrainingShop() {
  const { 
    currentView, 
    isAuthenticated, 
    isAdmin, 
    setView, 
    logout, 
    popupDuration, 
    user, 
    cartItems, 
    cartSum, 
    cartTotalItems, 
    setCart,
    token 
  } = useShopStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);

  // Инициализация при загрузке
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await fetchSettings();
      setIsLoading(false);
    };
    init();
  }, []);

  // Загрузка корзины
  const fetchCart = useCallback(async () => {
    if (!token || !user) return;
    
    try {
      const res = await fetch('/api/cart', {
        headers: {
          'x-user-id': user.id || '',
          'x-role': user.role || 'Student',
        },
      });
      const data = await res.json();
      setCart(data.items || [], data.sum || 0, data.totalItems || 0);
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  }, [token, user, setCart]);

  // Обновлять корзину при смене вида на shop
  useEffect(() => {
    if (isAuthenticated && !isAdmin && currentView === 'shop') {
      fetchCart();
    }
  }, [isAuthenticated, isAdmin, currentView, fetchCart]);

  // Обновить количество товара в корзине
  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });

      if (res.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Update quantity error:', error);
    }
  };

  // Удалить товар из корзины
  const removeFromCart = async (productId: string) => {
    try {
      await fetch(`/api/cart?productId=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });
      fetchCart();
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  // Оформление заказа
  const checkout = async () => {
    if (cartItems.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutStep(1);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (!res.ok) {
        setCheckoutStep(0);
        toast.error(data.popupMessage || data.error, { duration: 5000 });
        setIsCheckingOut(false);
        return;
      }

      setTimeout(() => {
        setCheckoutStep(2);
        setTimeout(() => {
          setCheckoutStep(0);
          setShowCart(false);
        }, 3000);
      }, 10000);

      setCart([], 0, 0);

    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutStep(0);
      toast.error('Ошибка оформления заказа');
    } finally {
      setIsCheckingOut(false);
    }
  };

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
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
                {isAdmin ? '🔑 Admin' : (user?.role === 'Visor' ? '👁 Visor' : '📚 Student')}
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
                  
                  {/* Корзина с суммой */}
                  <button
                    onClick={() => setShowCart(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-lg hover:bg-emerald-600/30 transition"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">{cartTotalItems}</span>
                    <span className="text-emerald-300">({formatPrice(cartSum)})</span>
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

      {/* Боковая панель корзины */}
      {!isAdmin && showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCart(false)}
          />
          <Card className="relative w-full max-w-md h-full bg-gray-900 border-l border-gray-800 rounded-none">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">🛒 Корзина</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Корзина пуста</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id} className="bg-gray-800 p-3 rounded-lg">
                      <div className="flex gap-3">
                        <img
                          src={item.product.imageUrl || `https://via.placeholder.com/60?text=${item.product.name[0]}`}
                          alt={item.product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{item.product.name}</p>
                          <p className="text-emerald-400 text-sm">{formatPrice(item.product.price)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 bg-gray-700 rounded hover:bg-gray-600"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1 ml-auto text-red-400 hover:bg-red-400/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-400">Итого:</span>
                <span className="text-2xl font-bold text-emerald-400">{formatPrice(cartSum)}</span>
              </div>
              <Button
                onClick={checkout}
                disabled={cartItems.length === 0 || isCheckingOut}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                {isCheckingOut ? '⏳ Оформление...' : '💳 Оплатить'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно оформления заказа */}
      {!isAdmin && checkoutStep > 0 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            {checkoutStep === 1 && (
              <>
                <div className="relative mb-6 inline-block">
                  <div className="w-24 h-24 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-4xl">🧝</span>
                </div>
                <h2 className="text-white text-xl font-bold mb-2">Добби достаёт товары со склада и упаковывает для Вас...</h2>
                <p className="text-gray-400 text-lg">Подожди чуток!</p>
              </>
            )}
            {checkoutStep === 2 && (
              <>
                <div className="text-6xl mb-4">📦✨</div>
                <h2 className="text-emerald-400 text-xl font-bold mb-2">Заказ оформлен!</h2>
                <p className="text-gray-300">Всё упаковано и отправлено по указанному адресу доставки. Спасибо за покупку!</p>
              </>
            )}
          </div>
        </div>
      )}

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
