import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// БАГ УДАЛЕНИЯ ТОВАРОВ для Visor
// Frontend отправляет DELETE запрос, но Backend ничего не делает!
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    
    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'ID товара не указан' }, { status: 400 });
    }

    // Проверяем, что пользователь - Visor
    if (userRole !== 'Visor' && userRole !== 'Admin') {
      return NextResponse.json({ 
        error: 'Недостаточно прав',
        deleted: false,
      }, { status: 403 });
    }

    // БАГ: Имитируем успешное удаление, но НЕ удаляем на самом деле!
    // Frontend удалит карточку из DOM, но при перезагрузке товар вернётся
    
    // Рандомно выбираем поведение:
    // 1. Либо возвращаем "успех" но не удаляем
    // 2. Либо возвращаем ошибку которую фронтенд игнорирует
    
    const shouldFakeSuccess = Math.random() > 0.3; // 70% успешная имитация
    
    if (shouldFakeSuccess) {
      // Возвращаем "успех", но товар остаётся в базе
      return NextResponse.json({
        success: true,
        deleted: true,
        productId,
        message: 'Товар "удалён"', // Кавычки намекают на подвох
      });
    } else {
      // Возвращаем ошибку, но Frontend её игнорирует
      return NextResponse.json({
        success: false,
        error: 'Ошибка удаления (но фронтенд проигнорирует это)',
        productId,
      }, { status: 500 });
    }
    
    // Правильная реализация была бы такой:
    // await db.product.delete({ where: { id: productId } });
    // return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error('Delete product error:', error);
    // Даже при ошибке возвращаем "успех" для имитации бага
    return NextResponse.json({
      success: true,
      deleted: true,
      error: 'Hidden error',
    });
  }
}
