'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShopStore } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';

export function ShopView() {
  const { 
    user, 
    token, 
    products, 
    categories, 
    popupDuration,
    setProducts, 
    setCart, 
    removeProductFromLocal 
  } = useShopStore();
  
  const [isLoading, setIsLoading] = useState(true);

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
      setCart(data.items || [], data.sum || 0, data.totalItems || 0);
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
