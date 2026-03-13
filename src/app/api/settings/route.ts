import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Получить настройки
export async function GET() {
  try {
    const settings = await db.settings.findFirst();
    
    if (!settings) {
      const defaultSettings = await db.settings.create({
        data: {
          popupSuccessDuration: 2,
          popupErrorDuration: 3,
          popupWarningDuration: 2.5,
          popupInfoDuration: 1.5,
          popupDuration: 1,
        },
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
    const { 
      popupDuration,
      popupSuccessDuration,
      popupErrorDuration,
      popupWarningDuration,
      popupInfoDuration,
    } = body;

    const settings = await db.settings.findFirst();
    
    const updateData: Record<string, number> = {};
    if (popupDuration !== undefined) updateData.popupDuration = parseFloat(popupDuration);
    if (popupSuccessDuration !== undefined) updateData.popupSuccessDuration = parseFloat(popupSuccessDuration);
    if (popupErrorDuration !== undefined) updateData.popupErrorDuration = parseFloat(popupErrorDuration);
    if (popupWarningDuration !== undefined) updateData.popupWarningDuration = parseFloat(popupWarningDuration);
    if (popupInfoDuration !== undefined) updateData.popupInfoDuration = parseFloat(popupInfoDuration);
    
    if (settings) {
      const updated = await db.settings.update({
        where: { id: settings.id },
        data: updateData,
      });
      return NextResponse.json(updated);
    } else {
      const created = await db.settings.create({
        data: {
          popupSuccessDuration: popupSuccessDuration ? parseFloat(popupSuccessDuration) : 2,
          popupErrorDuration: popupErrorDuration ? parseFloat(popupErrorDuration) : 3,
          popupWarningDuration: popupWarningDuration ? parseFloat(popupWarningDuration) : 2.5,
          popupInfoDuration: popupInfoDuration ? parseFloat(popupInfoDuration) : 1.5,
          popupDuration: popupDuration ? parseFloat(popupDuration) : 1,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Ошибка обновления настроек' }, { status: 500 });
  }
}
