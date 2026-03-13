import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Логирование попытки входа с фейковыми кредами
 * Записывается в VisorLog как пасхалка
 */
export async function POST(request: NextRequest) {
  try {
    const { login } = await request.json();
    
    // Получаем IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Создаём запись в VisorLog
    await db.visorLog.create({
      data: {
        userId: 'trap',
        login: `${login} (попытка входа в админку с фейковыми данными)`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trap log error:', error);
    return NextResponse.json({ error: 'Ошибка логирования' }, { status: 500 });
  }
}
