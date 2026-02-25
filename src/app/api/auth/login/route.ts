import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Авторизация с багом Charles и пасхалкой Power Rangers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { login, password } = body;
    
    // Получаем заголовок X-Role для пасхалки Power Rangers
    const xRole = request.headers.get('x-role') || 'Green Power Ranger';
    
    // Проверяем, есть ли пользователь в таблице User
    let user = await db.user.findUnique({
      where: { login },
    });
    
    // Если не нашли в User, проверяем Admin
    let isAdmin = false;
    if (!user) {
      const admin = await db.admin.findUnique({
        where: { login },
      });
      if (admin) {
        isAdmin = true;
        user = {
          id: admin.id,
          login: admin.login,
          password: admin.password,
          role: 'Admin',
          expertMode: false,
          fullName: 'Администратор',
        } as any;
      }
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    // БАГ CHARLES: Проверка пароля с учетом Expert Mode
    // Frontend всегда добавляет '!' в конец пароля
    
    if (user.expertMode) {
      // Expert Mode = True: Строгая проверка пароля
      // Пароль должен совпадать ТОЧНО (с '!' в базе или без - как есть)
      if (password !== user.password) {
        return NextResponse.json(
          { error: 'Неверный пароль' },
          { status: 401 }
        );
      }
    } else {
      // Expert Mode = False: Игнорируем '!' в конце
      // Принимаем пароль и с '!' и без
      const cleanPassword = password.endsWith('!') 
        ? password.slice(0, -1) 
        : password;
      
      if (cleanPassword !== user.password && password !== user.password) {
        return NextResponse.json(
          { error: 'Неверный пароль' },
          { status: 401 }
        );
      }
    }

    // ПАСХАЛКА POWER RANGERS: Проверка заголовка X-Role
    let finalRole = user.role;
    let visorElevated = false;
    
    if (xRole === 'Red Power Ranger' && user.role === 'Student') {
      finalRole = 'Visor';
      visorElevated = true;
      
      // Логируем повышение прав
      await db.visorLog.create({
        data: {
          userId: user.id,
          login: user.login,
        },
      });
    }

    // Логируем вход
    await db.loginLog.create({
      data: {
        userId: user.id,
        login: user.login,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown',
      },
    });

    // Обновляем роль в базе если повысили
    if (visorElevated) {
      await db.user.update({
        where: { id: user.id },
        data: { role: 'Visor' },
      });
    }

    // Генерируем простой токен (в реальном проекте используйте JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        login: user.login,
        role: finalRole,
        fullName: user.fullName,
        expertMode: user.expertMode,
      },
      isAdmin,
      message: visorElevated 
        ? '🎉 Power Ranger mode activated! You are now Visor!' 
        : undefined,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка авторизации' },
      { status: 500 }
    );
  }
}
