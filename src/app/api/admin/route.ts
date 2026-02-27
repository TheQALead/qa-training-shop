import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Получить данные для админки
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section') || 'all';

    const result: Record<string, unknown> = {};

    // Проверка авторизации админа
    const adminToken = request.headers.get('x-admin-token');
    
    // Получаем настройки
    const settings = await db.settings.findFirst();
    result.settings = settings;

    switch (section) {
      case 'users':
        result.users = await db.user.findMany({
          orderBy: { createdAt: 'desc' },
        });
        break;
        
      case 'products':
        result.products = await db.product.findMany({
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
        break;
        
      case 'login_logs':
        result.loginLogs = await db.loginLog.findMany({
          orderBy: { timestamp: 'desc' },
          take: 100,
        });
        break;
        
      case 'visor_logs':
        result.visorLogs = await db.visorLog.findMany({
          orderBy: { timestamp: 'desc' },
        });
        break;
        
      case 'all':
        result.users = await db.user.findMany({
          orderBy: { createdAt: 'desc' },
        });
        result.products = await db.product.findMany({
          orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
        result.loginLogs = await db.loginLog.findMany({
          orderBy: { timestamp: 'desc' },
          take: 100,
        });
        result.visorLogs = await db.visorLog.findMany({
          orderBy: { timestamp: 'desc' },
        });
        // Получаем все карты с информацией о пользователе
        result.cards = await db.card.findMany({
          include: {
            user: {
              select: { id: true, login: true, fullName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        });
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения данных' },
      { status: 500 }
    );
  }
}

// POST - Создать пользователя (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_user': {
        const user = await db.user.create({
          data: {
            login: data.login,
            password: data.password,
            role: data.role || 'Student',
            fullName: data.fullName,
          },
        });
        return NextResponse.json(user);
      }
      
      case 'create_product': {
        const product = await db.product.create({
          data: {
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
            stock: parseInt(data.stock),
            imageUrl: data.imageUrl || null,
          },
        });
        return NextResponse.json(product);
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin POST error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания' },
      { status: 500 }
    );
  }
}

// PUT - Обновить данные
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'update_user': {
        // Частичное обновление - обновляем только переданные поля
        const updateData: Record<string, unknown> = {};
        if (data.login !== undefined) updateData.login = data.login;
        if (data.password !== undefined) updateData.password = data.password;
        if (data.role !== undefined) updateData.role = data.role;
        if (data.fullName !== undefined) updateData.fullName = data.fullName;
        
        const user = await db.user.update({
          where: { id: data.id },
          data: updateData,
        });
        return NextResponse.json(user);
      }
      
      case 'update_product': {
        const product = await db.product.update({
          where: { id: data.id },
          data: {
            name: data.name,
            category: data.category,
            price: parseFloat(data.price),
            stock: parseInt(data.stock),
            imageUrl: data.imageUrl || null,
          },
        });
        return NextResponse.json(product);
      }
      
      case 'update_settings': {
        const settings = await db.settings.findFirst();
        if (settings) {
          const updated = await db.settings.update({
            where: { id: settings.id },
            data: {
              popupDuration: parseFloat(data.popupDuration),
            },
          });
          return NextResponse.json(updated);
        } else {
          const created = await db.settings.create({
            data: {
              popupDuration: parseFloat(data.popupDuration),
            },
          });
          return NextResponse.json(created);
        }
      }
      
      case 'update_card_balance': {
        const card = await db.card.update({
          where: { id: data.id },
          data: {
            balance: parseFloat(data.balance),
          },
        });
        return NextResponse.json(card);
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin PUT error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления' },
      { status: 500 }
    );
  }
}

// DELETE - Удалить пользователя или товар
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const id = searchParams.get('id');

    switch (action) {
      case 'delete_user': {
        await db.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }
      
      case 'delete_product': {
        await db.product.delete({ where: { id } });
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin DELETE error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления' },
      { status: 500 }
    );
  }
}
