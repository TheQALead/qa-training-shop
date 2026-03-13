import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Проверка токена авторизации
 * Используется для восстановления сессии при обновлении страницы
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Декодируем токен (формат: "userId:timestamp")
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestamp] = decoded.split(':');

    if (!userId) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Проверяем что токен не старше 24 часов
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа

    if (isNaN(tokenTime) || now - tokenTime > maxAge) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Ищем пользователя
    let user = await db.user.findUnique({ where: { id: userId } });
    let isAdmin = false;

    if (!user) {
      // Проверяем админа
      const admin = await db.admin.findUnique({ where: { id: userId } });
      if (admin) {
        isAdmin = true;
        user = {
          id: admin.id,
          login: admin.login,
          password: admin.password,
          role: 'Admin',
          fullName: 'Администратор',
        } as any;
      }
    }

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
      },
      isAdmin,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
