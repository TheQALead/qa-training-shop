import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Получить профиль пользователя
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        cards: true,
        cartItems: {
          include: { product: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
        expertMode: user.expertMode,
        createdAt: user.createdAt,
      },
      cards: user.cards,
      cartItems: user.cartItems,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения профиля' },
      { status: 500 }
    );
  }
}

// PUT - Обновить профиль
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName } = body;

    const user = await db.user.update({
      where: { id: userId },
      data: { fullName },
    });

    return NextResponse.json({
      id: user.id,
      login: user.login,
      role: user.role,
      fullName: user.fullName,
      expertMode: user.expertMode,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления профиля' },
      { status: 500 }
    );
  }
}
