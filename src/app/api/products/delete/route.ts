import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isBugEnabled } from '@/lib/bug-utils';

// Удаление товаров для Visor
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

    // Проверяем права
    if (userRole !== 'Visor' && userRole !== 'Admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    // Проверяем баг
    const fakeDeleteEnabled = await isBugEnabled(userId, 'fake-delete');

    if (fakeDeleteEnabled) {
      // БАГ: Имитируем успех, но НЕ удаляем
      return NextResponse.json({
        success: true,
        deleted: true,
        productId,
        message: 'Товар "удалён"',
      });
    } else {
      // Баг выключен - нормальное удаление
      await db.product.delete({ where: { id: productId } });
      return NextResponse.json({ success: true, deleted: true });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 });
  }
}
