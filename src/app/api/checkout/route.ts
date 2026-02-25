import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Оплатить заказ
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { cardId } = body;

    // 1. Проверка привязки карты
    const cards = await db.card.findMany({
      where: { userId },
    });

    if (cards.length === 0) {
      return NextResponse.json({
        success: false,
        step: 'card_check',
        error: 'Привяжи карту',
        popupMessage: 'Для оплаты необходимо привязать карту в разделе "Мои данные"',
      }, { status: 400 });
    }

    // 2. Получаем корзину
    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({
        success: false,
        step: 'cart_check',
        error: 'Корзина пуста',
      }, { status: 400 });
    }

    // 3. Проверка остатков на складе
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          step: 'stock_check',
          error: 'Не достаточно товара',
          popupMessage: `Товар "${item.product.name}" закончился на складе. Доступно: ${item.product.stock}`,
          product: item.product.name,
          available: item.product.stock,
        }, { status: 400 });
      }
    }

    // 4. Считаем сумму с БАГОМ
    const realSum = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let buggySum = realSum;
    if (realSum % 10 === 0) {
      buggySum = realSum + 1000;
    } else {
      buggySum = realSum + 139;
    }

    // 5. Проверяем баланс карты
    let card = cards[0];
    if (cardId) {
      const foundCard = cards.find(c => c.id === cardId);
      if (foundCard) card = foundCard;
    }

    if (card.balance < buggySum) {
      return NextResponse.json({
        success: false,
        step: 'balance_check',
        error: 'Денежек не достаточно',
        popupMessage: `На карте недостаточно средств. Баланс: ${card.balance} ₽, Требуется: ${buggySum} ₽`,
        balance: card.balance,
        required: buggySum,
      }, { status: 400 });
    }

    // 6. Все проверки пройдены - выполняем заказ
    
    // Списываем товары со склада
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    // Списываем БАЖНУЮ сумму с карты
    await db.card.update({
      where: { id: card.id },
      data: {
        balance: { decrement: buggySum },
      },
    });

    // Очищаем корзину
    await db.cartItem.deleteMany({
      where: { userId },
    });

    // Возвращаем успех с PopUp сообщениями
    return NextResponse.json({
      success: true,
      buggySum,
      realSum,
      steps: [
        {
          delay: 10000, // 10 секунд
          message: '🧝 Добби достаёт товары со склады и упаковываем для Вас, подожди чуток...',
        },
        {
          delay: 3000, // 3 секунды после первого
          message: '📦 Всё упаковано и отправлено по указанному адресу доставки, Спасибо за покупку!',
          // БАГ: Адрес никто не указывал!
        },
      ],
      orderDetails: {
        items: cartItems.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        totalSum: buggySum,
        address: 'Не указан', // БАГ!
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Ошибка оформления заказа' },
      { status: 500 }
    );
  }
}
