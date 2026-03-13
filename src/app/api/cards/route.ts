import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBugEnabled } from '@/lib/bug-utils';

// GET - Получить карты пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const cards = await db.card.findMany({ where: { userId } });
    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json({ error: 'Ошибка получения карт' }, { status: 500 });
  }
}

// POST - Добавить карту
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Проверяем баги
    const [cardDuplicateBugEnabled, cardTypoBugEnabled] = await Promise.all([
      isBugEnabled(userId, 'card-duplicate-digit'),
      isBugEnabled(userId, 'card-typo-error'),
    ]);

    const body = await request.json();
    const { owner, number, date, cvv, isBuggy } = body;

    // БАГ: Проверка номера с дублированной последней цифрой
    if (isBuggy && cardDuplicateBugEnabled) {
      const lastTwoDigits = number.slice(-2);
      if (lastTwoDigits[0] === lastTwoDigits[1]) {
        // Возвращаем ошибку с опечаткой если баг включен
        return NextResponse.json(
          { detail: cardTypoBugEnabled ? 'Не верно указаны даные' : 'Не верно указаны данные' },
          { status: 400 }
        );
      }
    }

    const card = await db.card.create({
      data: {
        userId,
        owner,
        number,
        date,
        cvv,
        balance: 20000,
        isBuggy: isBuggy || false,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ error: 'Ошибка создания карты' }, { status: 500 });
  }
}

// PUT - Обновить карту
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { id, owner, number, date, cvv, balance } = body;

    const card = await db.card.update({
      where: { id, userId }, // Проверяем, что карта принадлежит пользователю
      data: {
        owner,
        number,
        date,
        cvv,
        balance,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления карты' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить карту
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID карты не указан' }, { status: 400 });
    }

    await db.card.delete({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete card error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления карты' },
      { status: 500 }
    );
  }
}
