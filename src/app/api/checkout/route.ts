import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBugEnabled } from '@/lib/bug-utils';

// POST - Оплатить заказ
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Проверяем баги
    const [cartSumBugEnabled, missingAddressBugEnabled] = await Promise.all([
      isBugEnabled(userId, 'cart-sum-bug'),
      isBugEnabled(userId, 'missing-address'),
    ]);

    const body = await request.json();
    const { cardId } = body;

    // 1. Проверка привязки карты
    const cards = await db.card.findMany({ where: { userId } });

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

    // 3. Проверка остатков
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return NextResponse.json({
          success: false,
          step: 'stock_check',
          error: 'Не достаточно товара',
          popupMessage: `Товар "${item.product.name}" закончился. Доступно: ${item.product.stock}`,
        }, { status: 400 });
      }
    }

    // 4. Считаем сумму
    const realSum = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    let displaySum = realSum;
    if (cartSumBugEnabled) {
      if (realSum % 10 === 0) {
        displaySum = realSum + 1000;
      } else {
        displaySum = realSum + 139;
      }
    }

    // 5. Проверяем баланс
    let card = cards[0];
    if (cardId) {
      const foundCard = cards.find(c => c.id === cardId);
      if (foundCard) card = foundCard;
    }

    if (card.balance < displaySum) {
      return NextResponse.json({
        success: false,
        step: 'balance_check',
        error: 'Недостаточно средств',
        popupMessage: `На карте недостаточно средств. Баланс: ${card.balance} ₽, Требуется: ${displaySum} ₽`,
      }, { status: 400 });
    }

    // 6. Выполняем заказ
    for (const item of cartItems) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await db.card.update({
      where: { id: card.id },
      data: { balance: { decrement: displaySum } },
    });

    await db.cartItem.deleteMany({ where: { userId } });

    // Формируем сообщение
    const addressMessage = missingAddressBugEnabled
      ? '📦 Всё упаковано и отправлено по указанному адресу доставки. Спасибо за покупку!'
      : '📦 Заказ готов к выдаче. Спасибо за покупку!';

    return NextResponse.json({
      success: true,
      totalSum: displaySum,
      steps: [
        { delay: 10000, message: '🧝 Добби достаёт товары со склада...' },
        { delay: 3000, message: addressMessage },
      ],
      orderDetails: {
        items: cartItems.map(i => ({
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
        })),
        totalSum: displaySum,
        address: missingAddressBugEnabled ? 'Не указан' : 'Самовывоз',
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Ошибка оформления заказа' }, { status: 500 });
  }
}
