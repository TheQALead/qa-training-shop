import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBugEnabled } from '@/lib/bug-utils';

// Авторизация
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { login, password } = body;
    
    const xRole = request.headers.get('x-role') || 'Green Power Ranger';
    
    let user = await db.user.findUnique({ where: { login } });
    
    let isAdmin = false;
    if (!user) {
      const admin = await db.admin.findUnique({ where: { login } });
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
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 });
    }

    // Проверяем состояние багов
    const charlesBugEnabled = await isBugEnabled(user.id, 'charles-bug');
    const powerRangersEnabled = await isBugEnabled(user.id, 'power-rangers');

    // Проверка пароля
    if (charlesBugEnabled) {
      // Баг включен: пароль уходит с "!" или без - принимаем оба варианта
      const cleanPassword = password.endsWith('!') ? password.slice(0, -1) : password;
      if (cleanPassword !== user.password && password !== user.password) {
        return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
      }
    } else {
      // Баг выключен: строгая проверка
      if (password !== user.password) {
        return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
      }
    }

    // ПАСХАЛКА POWER RANGERS
    let finalRole = user.role;
    let visorElevated = false;
    
    if (powerRangersEnabled && xRole === 'Red Power Ranger' && user.role === 'Student') {
      finalRole = 'Visor';
      visorElevated = true;
      await db.visorLog.create({ data: { userId: user.id, login: user.login } });
    }

    await db.loginLog.create({
      data: {
        userId: user.id,
        login: user.login,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      },
    });

    if (visorElevated) {
      await db.user.update({ where: { id: user.id }, data: { role: 'Visor' } });
    }

    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: { id: user.id, login: user.login, role: finalRole, fullName: user.fullName },
      isAdmin,
      message: visorElevated ? '🎉 Power Ranger mode activated!' : undefined,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Ошибка авторизации' }, { status: 500 });
  }
}
