import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Инициализация базы данных с тестовыми данными
export async function GET() {
  try {
    // Проверяем, есть ли уже товары
    const existingProducts = await db.product.count();
    
    if (existingProducts > 0) {
      return NextResponse.json({ message: 'Database already initialized' });
    }

    // Создаем админа
    await db.admin.create({
      data: {
        login: 'Makarov',
        password: 'QAAdmin',
      },
    });

    // Создаем тестовых пользователей
    await db.user.createMany({
      data: [
        {
          login: 'student1',
          password: 'pass123',
          role: 'Student',
          expertMode: false,
          fullName: 'Иванов Иван Иванович',
        },
        {
          login: 'student2',
          password: 'test456',
          role: 'Student',
          expertMode: true,
          fullName: 'Петров Петр Петрович',
        },
        {
          login: 'visor1',
          password: 'visor123',
          role: 'Visor',
          expertMode: false,
          fullName: 'Сидоров Сидор Сидорович',
        },
      ],
    });

    // Создаем тестовые товары
    await db.product.createMany({
      data: [
        { name: 'iPhone 15 Pro', category: 'Электроника', price: 99990, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&h=300&fit=crop' },
        { name: 'MacBook Air M3', category: 'Электроника', price: 129990, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop' },
        { name: 'AirPods Pro 2', category: 'Электроника', price: 24990, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop' },
        { name: 'Samsung Galaxy S24', category: 'Электроника', price: 79990, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=300&h=300&fit=crop' },
        { name: 'Sony WH-1000XM5', category: 'Электроника', price: 34990, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop' },
        { name: 'Nike Air Max 270', category: 'Одежда', price: 14990, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop' },
        { name: 'Adidas Ultraboost', category: 'Одежда', price: 17990, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=300&h=300&fit=crop' },
        { name: 'Levi\'s 501 Jeans', category: 'Одежда', price: 7990, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop' },
        { name: 'North Face Jacket', category: 'Одежда', price: 24990, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop' },
        { name: 'Ray-Ban Sunglasses', category: 'Одежда', price: 12990, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop' },
        { name: 'Clean Code', category: 'Книги', price: 1490, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop' },
        { name: 'The Pragmatic Programmer', category: 'Книги', price: 1990, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=300&fit=crop' },
        { name: 'Design Patterns', category: 'Книги', price: 2490, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=300&fit=crop' },
        { name: 'JavaScript: The Good Parts', category: 'Книги', price: 1290, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=300&fit=crop' },
        { name: 'Refactoring', category: 'Книги', price: 1790, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=300&fit=crop' },
        { name: 'Йога-мат', category: 'Спорт', price: 2990, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop' },
        { name: 'Гантели 5кг', category: 'Спорт', price: 3990, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=300&fit=crop' },
        { name: 'Велосипед MTB', category: 'Спорт', price: 45990, stock: 5, imageUrl: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&h=300&fit=crop' },
        { name: 'Скейтборд', category: 'Спорт', price: 7990, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=300&h=300&fit=crop' },
        { name: 'Беговая дорожка', category: 'Спорт', price: 59990, stock: 3, imageUrl: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=300&h=300&fit=crop' },
        { name: 'Robot Vacuum Cleaner', category: 'Бытовая техника', price: 29990, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop' },
        { name: 'Coffee Machine', category: 'Бытовая техника', price: 45990, stock: 8, imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300&h=300&fit=crop' },
        { name: 'Air Purifier', category: 'Бытовая техника', price: 19990, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=300&h=300&fit=crop' },
        { name: 'Blender Pro', category: 'Бытовая техника', price: 8990, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=300&h=300&fit=crop' },
        { name: 'Smart TV 55"', category: 'Бытовая техника', price: 59990, stock: 6, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=300&fit=crop' },
      ],
    });

    // Создаем настройки
    await db.settings.create({
      data: {
        popupDuration: 1,
      },
    });

    return NextResponse.json({ 
      message: 'Database initialized successfully',
      created: {
        admin: 1,
        users: 3,
        products: 25,
        settings: 1,
      }
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
