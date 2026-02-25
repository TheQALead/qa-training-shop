import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Получить настройки
export async function GET() {
  try {
    const settings = await db.settings.findFirst();
    
    if (!settings) {
      const defaultSettings = await db.settings.create({
        data: { popupDuration: 1 },
      });
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Ошибка получения настроек' }, { status: 500 });
  }
}

// PUT - Обновить настройки
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { popupDuration } = body;

    const settings = await db.settings.findFirst();
    
    if (settings) {
      const updated = await db.settings.update({
        where: { id: settings.id },
        data: { popupDuration: parseFloat(popupDuration) },
      });
      return NextResponse.json(updated);
    } else {
      const created = await db.settings.create({
        data: { popupDuration: parseFloat(popupDuration) },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ошибка обновления настроек' }, { status: 500 });
  }
}
