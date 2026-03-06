import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Логирование пасхалок
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, login, password } = body;

    if (type === 'fake-admin-attempt') {
      // Получаем IP
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';

      // Записываем в EasterEggLog
      await db.easterEggLog.create({
        data: {
          type: 'fake-admin-attempt',
          login: login || 'unknown',
          data: JSON.stringify({ password: password || 'unknown' }),
          ip,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Попытка входа с фейковыми данными записана' 
      });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Easter egg log error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Получение логов пасхалок (для админки)
export async function GET(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token');
    
    const admin = await db.admin.findFirst();
    if (!admin || admin.id !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await db.easterEggLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Get easter egg logs error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
