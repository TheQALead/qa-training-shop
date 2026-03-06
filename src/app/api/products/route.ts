import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Получить все товары с группировкой по категориям
export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // Группируем по категориям
    const categories = products.reduce((acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    return NextResponse.json({
      products,
      categories,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Ошибка получения товаров' },
      { status: 500 }
    );
  }
}

// POST - Добавить новый товар (Admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, price, stock, imageUrl } = body;

    const product = await db.product.create({
      data: {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Ошибка создания товара' },
      { status: 500 }
    );
  }
}

// PUT - Обновить товар (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, price, stock, imageUrl } = body;

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl: imageUrl || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления товара' },
      { status: 500 }
    );
  }
}
