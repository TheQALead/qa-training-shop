import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBugEnabled } from '@/lib/bug-utils';

// GET - Получить корзину пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const cartItems = await db.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    // Считаем реальную сумму
    const realSum = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Проверяем баг подсчёта суммы
    const cartSumBugEnabled = await isBugEnabled(userId, 'cart-sum-bug');

    let displaySum = realSum;
    if (cartSumBugEnabled) {
      // БАГ: добавляем лишнее
      if (realSum % 10 === 0) {
        displaySum = realSum + 1000;
      } else {
        displaySum = realSum + 139;
      }
    }

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      items: cartItems,
      totalItems,
      realSum,
      sum: displaySum,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json({ error: 'Ошибка получения корзины' }, { status: 500 });
  }
}

// POST - Добавить товар в корзину
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity = 1 } = body;

    // Проверяем, есть ли товар уже в корзине
    const existingItem = await db.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Обновляем количество
      const updated = await db.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantity,
        },
        include: { product: true },
      });
      return NextResponse.json(updated);
    }

    // Создаём новый элемент
    const cartItem = await db.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: { product: true },
    });

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка добавления в корзину' },
      { status: 500 }
    );
  }
}

// PUT - Обновить количество товара
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (quantity <= 0) {
      // Удаляем товар
      await db.cartItem.deleteMany({
        where: { userId, productId },
      });
      return NextResponse.json({ deleted: true });
    }

    const updated = await db.cartItem.update({
      where: {
        userId_productId: { userId, productId },
      },
      data: { quantity },
      include: { product: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления корзины' },
      { status: 500 }
    );
  }
}

// DELETE - Очистить корзину или удалить товар
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (productId) {
      await db.cartItem.deleteMany({
        where: { userId, productId },
      });
    } else {
      await db.cartItem.deleteMany({
        where: { userId },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete cart error:', error);
    return NextResponse.json(
      { error: 'Ошибка очистки корзины' },
      { status: 500 }
    );
  }
}
