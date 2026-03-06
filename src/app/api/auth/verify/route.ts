import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Проверка валидности токена при обновлении страницы
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Токен в формате "Bearer <token>" или просто "<token>"
    const token = authHeader.replace('Bearer ', '');
    
    // Декодируем токен (формат: "userId:timestamp")
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId, timestamp] = decoded.split(':');
    
    if (!userId) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    // Проверяем существование пользователя
    const user = await db.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      // Проверяем админа
      const admin = await db.admin.findUnique({ where: { id: userId } });
      if (!admin) {
        return NextResponse.json({ valid: false }, { status: 401 });
      }
      
      return NextResponse.json({
        valid: true,
        user: {
          id: admin.id,
          login: admin.login,
          role: 'Admin',
          fullName: 'Администратор',
        },
        isAdmin: true,
      });
    }

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        fullName: user.fullName,
      },
      isAdmin: false,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
