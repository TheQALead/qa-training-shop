'use client';

import { useState, useEffect, useCallback } from 'react';
import { useShopStore, Card as CardType } from '@/lib/store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Trash2, Plus } from 'lucide-react';

export function ProfileView() {
  const { user, token, cards, setCards } = useShopStore();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Форма карты
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardOwner, setCardOwner] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardType, setCardType] = useState<'first' | 'second'>('first');

  // Загрузка профиля
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch('/api/profile', {
        headers: {
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
        setFullName(data.user?.fullName || '');
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, user, setCards]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Сохранить профиль
  const saveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({ fullName }),
      });

      if (res.ok) {
        toast.success('Профиль сохранён');
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error('Ошибка соединения');
    } finally {
      setIsSaving(false);
    }
  };

  // МАСКА для карты 1 (красивый ввод)
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ') : digits;
  };

  const formatCardDate = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2);
    }
    return digits;
  };

  // Обработчики ввода
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    
    if (cardType === 'first') {
      // Карта 1: Красивый ввод с маской (нормальное поведение)
      setCardNumber(rawValue);
    } else {
      // Карта 2: БАГ - ввод без маски, всё в одну строку
      setCardNumber(rawValue);
    }
  };

  const handleCardDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setCardDate(rawValue);
  };

  // БАГ КАРТЫ 1: Frontend дублирует последнюю цифру номера карты
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // БАГ: Для первой карты дублируем последнюю цифру номера
    let finalNumber = cardNumber;
    if (cardType === 'first') {
      finalNumber = cardNumber + cardNumber.slice(-1);
    }
    
    // Скрытый лог для QA (только в консоли разработчика)
    console.log('🔍 [DEBUG] Card type:', cardType);
    console.log('🔍 [DEBUG] Original card number:', cardNumber);
    console.log('🔍 [DEBUG] Card number sent to server:', finalNumber);
    
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
          'X-Role': 'Green Power Ranger',
        },
        body: JSON.stringify({
          owner: cardOwner,
          number: finalNumber,
          date: cardDate,
          cvv: cardCVV,
          isBuggy: cardType === 'first',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // БАГ: Ошибка с ОРФОГРАФИЧЕСКОЙ ошибкой "даные"
        if (data.detail) {
          toast.error(data.detail, { duration: 5000 });
        } else {
          toast.error(data.error || 'Ошибка');
        }
        return;
      }

      toast.success('Карта успешно добавлена');
      setCards([...cards, data]);
      setShowCardForm(false);
      setCardOwner('');
      setCardNumber('');
      setCardDate('');
      setCardCVV('');
      
    } catch (error) {
      console.error('Add card error:', error);
      toast.error('Ошибка соединения');
    }
  };

  // Удалить карту
  const deleteCard = async (cardId: string) => {
    try {
      await fetch(`/api/cards?id=${cardId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });
      
      setCards(cards.filter(c => c.id !== cardId));
      toast.success('Карта удалена');
    } catch (error) {
      console.error('Delete card error:', error);
      toast.error('Ошибка удаления');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-white mb-6">👤 Мои данные</h1>

      {/* Информация о пользователе */}
      <Card className="bg-gray-900 border-gray-800 mb-6">
        <CardHeader>
          <CardTitle className="text-white">Личная информация</CardTitle>
          <CardDescription className="text-gray-400">
            Ваш профиль в системе
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-400">Логин</Label>
              <p className="text-white font-medium">{user?.login}</p>
            </div>
            <div>
              <Label className="text-gray-400">Роль</Label>
              <Badge className={
                user?.role === 'Visor' 
                  ? 'bg-purple-600' 
                  : user?.role === 'Admin' 
                    ? 'bg-red-600' 
                    : 'bg-emerald-600'
              }>
                {user?.role}
              </Badge>
            </div>
          </div>
          
          <Separator className="bg-gray-800" />
          
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-300">ФИО</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Введите ФИО"
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button 
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? '⏳' : '💾'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карты */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Мои карты
              </CardTitle>
              <CardDescription className="text-gray-400">
                Привяжите карту для оплаты покупок
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCardForm(!showCardForm)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить карту
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Форма добавления карты */}
          {showCardForm && (
            <Card className="bg-gray-800 border-gray-700 mb-4">
              <CardHeader>
                <CardTitle className="text-white text-lg">Новая карта</CardTitle>
                <div className="mt-2 p-3 bg-red-900/50 border border-red-500 rounded-lg">
                  <p className="text-red-300 text-sm font-bold flex items-center gap-2">
                    ⚠️ ВНИМАНИЕ!
                  </p>
                  <p className="text-red-200 text-sm mt-1">
                    НЕ ВВОДИТЕ СВОИ НАСТОЯЩИЕ ДАННЫЕ КАРТЫ! Это тренировочный сайт для QA. Используйте случайные данные!
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label className="text-gray-300">Выберите карту</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cardType"
                            checked={cardType === 'first'}
                            onChange={() => setCardType('first')}
                            className="accent-emerald-500"
                          />
                          <span className="text-gray-300">Карта 1</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="cardType"
                            checked={cardType === 'second'}
                            onChange={() => setCardType('second')}
                            className="accent-emerald-500"
                          />
                          <span className="text-gray-300">Карта 2</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="cardOwner" className="text-gray-300">Владелец</Label>
                      <Input
                        id="cardOwner"
                        value={cardOwner}
                        onChange={(e) => setCardOwner(e.target.value.toUpperCase())}
                        placeholder="IVAN IVANOV"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="cardNumber" className="text-gray-300">Номер карты</Label>
                      <Input
                        id="cardNumber"
                        value={cardType === 'first' ? formatCardNumber(cardNumber) : cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder={cardType === 'first' ? "1234 5678 9012 3456" : "1234567890123456"}
                        required
                        className={`bg-gray-700 border-gray-600 text-white ${
                          cardType === 'second' ? 'tracking-wider' : ''
                        }`}
                      />
                      {cardType === 'second' && cardNumber.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          {cardNumber}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="cardDate" className="text-gray-300">Срок</Label>
                      <Input
                        id="cardDate"
                        value={cardType === 'first' ? formatCardDate(cardDate) : cardDate}
                        onChange={handleCardDateChange}
                        placeholder={cardType === 'first' ? "MM/YY" : "MMYY"}
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardCVV" className="text-gray-300">CVV</Label>
                      <Input
                        id="cardCVV"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        required
                        type="password"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Добавить карту
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowCardForm(false)}
                      className="border-gray-600 text-gray-300"
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Список карт */}
          {cards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Нет привязанных карт</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="relative p-4 rounded-xl bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-gray-400 text-xs">Владелец</p>
                      <p className="text-white font-medium">{card.owner}</p>
                    </div>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="p-1 hover:bg-white/10 rounded transition"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  
                  <p className="text-white font-mono text-lg tracking-wider mb-2">
                    •••• •••• •••• {card.number.slice(-4)}
                  </p>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-gray-400 text-xs">Срок</p>
                      <p className="text-white">{card.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs">Баланс</p>
                      <p className="text-emerald-400 font-bold">
                        {new Intl.NumberFormat('ru-RU', {
                          style: 'currency',
                          currency: 'RUB',
                          maximumFractionDigits: 0,
                        }).format(card.balance)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
