import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { BUG_DEFINITIONS } from '@/lib/bugs';

/**
 * Получить состояние багов для логина (без авторизации)
 * Используется на странице логина, когда пользователь ещё не авторизован
 */
export async function GET(request: NextRequest) {
  try {
    const login = request.nextUrl.searchParams.get('login');
    
    if (!login) {
      // Если логин не указан, возвращаем дефолтные значения
      const defaults: Record<string, boolean> = {};
      for (const bug of BUG_DEFINITIONS) {
        defaults[bug.id] = bug.defaultEnabled;
      }
      return NextResponse.json({ bugs: defaults });
    }
    
    // Ищем пользователя
    const user = await db.user.findUnique({ where: { login } });
    
    if (!user) {
      // Пользователь не найден - возвращаем дефолтные значения
      const defaults: Record<string, boolean> = {};
      for (const bug of BUG_DEFINITIONS) {
        defaults[bug.id] = bug.defaultEnabled;
      }
      return NextResponse.json({ bugs: defaults });
    }
    
    // Получаем состояние багов для пользователя
    const userBugs = await db.userBug.findMany({ where: { userId: user.id } });
    const dbBugs = await db.bug.findMany();
    
    const bugsStatus: Record<string, boolean> = {};
    
    for (const bugDef of BUG_DEFINITIONS) {
      const userBug = userBugs.find(ub => ub.bugId === bugDef.id);
      if (userBug) {
        bugsStatus[bugDef.id] = userBug.enabled;
      } else {
        const dbBug = dbBugs.find(b => b.id === bugDef.id);
        bugsStatus[bugDef.id] = dbBug?.defaultEnabled ?? bugDef.defaultEnabled;
      }
    }
    
    return NextResponse.json({ bugs: bugsStatus });
  } catch (error) {
    console.error('Error getting bug status:', error);
    return NextResponse.json({ error: 'Ошибка получения статуса багов' }, { status: 500 });
  }
}
