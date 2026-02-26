'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShopStore, Product, CartItem } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Package,
  X
} from 'lucide-react';

export function ShopView() {
  const { 
    user, 
    token, 
    products, 
    categories, 
    cartItems, 
    cartSum, 
    cartTotalItems,
    popupDuration,
    setProducts, 
    setCart, 
    removeProductFromLocal 
  } = useShopStore();
  
  const [showCart, setShowCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Загрузка товаров
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products, data.categories);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Ошибка загрузки товаров');
    } finally {
      setIsLoading(false);
    }
  }, [setProducts]);

  // Загрузка корзины
  const fetchCart = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch('/api/cart', {
        headers: {
          'x-user-id': user?.id || '',
          'x-role': user?.role || 'Student',
        },
      });
      const data = await res.json();
      setCart(data.items || [], data.buggySum || 0, data.totalItems || 0);
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  }, [token, user, setCart]);

  useEffect(() => {
    fetchProducts();
    fetchCart();
  }, [fetchProducts, fetchCart]);

  // Добавить в корзину
  const addToCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (res.ok) {
        toast.success('Товар добавлен в корзину', { duration: popupDuration * 1000 });
        fetchCart();
      } else {
        toast.error('Ошибка добавления товара');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Ошибка соединения');
    }
  };

  // Обновить количество
  const updateQuantity = async (productId: string, newQuantity: number) => {
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

  // БАГ: Фейковое удаление товара для Visor
  const deleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/delete?id=${productId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
          'x-user-role': user?.role || 'Student',
          'X-Role': 'Green Power Ranger',
        },
      });

      // Frontend УДАЛЯЕТ карточку из DOM независимо от ответа сервера
      removeProductFromLocal(productId);
      toast.success('Товар "удалён"', { duration: popupDuration * 1000 });
      
      // БАГ: При перезагрузке страницы товар вернётся!
      // Сервер на самом деле не удалил его из базы
    } catch (error) {
      console.error('Delete product error:', error);
      // Даже при ошибке - удаляем из DOM
      removeProductFromLocal(productId);
    }
  };

  // Оформление заказа
  const checkout = async () => {
    if (cartItems.length === 0) {
      toast.error('Корзина пуста');
      return;
    }

    setIsCheckingOut(true);

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
        // Показываем ошибку
        toast.error(data.popupMessage || data.error, { duration: 5000 });
        setIsCheckingOut(false);
        return;
      }

      // Успешное оформление - показываем последовательные PopUp
      toast.info(data.steps[0].message, { duration: 10000 });
      
      setTimeout(() => {
        toast.success(data.steps[1].message, { duration: 3000 });
        
        // БАГ: "отправлено по указанному адресу доставки"
        // Но адрес никто не указывал!
        setTimeout(() => {
          toast.warning('🤔 Куда отправлено-то? Адрес ведь не указан...', { 
            duration: 5000 
          });
        }, 3500);
      }, 10000);

      // Очищаем корзину
      setCart([], 0, 0);
      setShowCart(false);
      
      // Обновляем товары (остатки изменились)
      fetchProducts();

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Ошибка оформления заказа');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Форматирование цены
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Корзина в шапке */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition"
        >
          <ShoppingCart className="w-6 h-6 text-emerald-400" />
          {cartTotalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
              {cartTotalItems}
            </Badge>
          )}
        </button>
      </div>

      {/* Боковая панель корзины */}
      {showCart && (
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
            
            <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
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
                {/* БАГ: Показываем БАЖНУЮ сумму! */}
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

      {/* Товары по категориям */}
      {Object.entries(categories).map(([category, categoryProducts]) => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400">
              {category}
            </Badge>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryProducts.map((product) => (
              <Card 
                key={product.id} 
                className="bg-gray-900 border-gray-800 hover:border-gray-700 transition group relative"
              >
                {/* Кнопка удаления только для Visor */}
                {user?.role === 'Visor' && (
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="absolute top-2 right-2 z-10 p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                    title="Удалить товар"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                )}
                
                <img
                  src={product.imageUrl || `https://via.placeholder.com/300?text=${product.name}`}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-bold text-emerald-400">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className="text-xs">
                      {product.stock > 0 ? `В наличии: ${product.stock}` : 'Нет в наличии'}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => addToCart(product.id)}
                    disabled={product.stock === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    В корзину
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
