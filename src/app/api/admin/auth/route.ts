import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Авторизация админа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password } = body;

    const admin = await db.admin.findUnique({
      where: { login },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Админ не найден' },
        { status: 401 }
      );
    }

    if (admin.password !== password) {
      return NextResponse.json(
        { error: 'Неверный пароль' },
        { status: 401 }
      );
    }

    // Генерируем токен админа
    const token = Buffer.from(`admin:${admin.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        login: admin.login,
      },
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500 }
    );
  }
}
