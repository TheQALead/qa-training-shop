// Initialize database with default data
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-require-imports */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Check if admin exists
  const adminCount = await prisma.admin.count();
  
  if (adminCount === 0) {
    // Create default admin
    await prisma.admin.create({
      data: {
        login: 'admin',
        password: 'admin123',
      },
    });
    console.log('Default admin created: admin / admin123');
  }

  // Check if settings exist
  const settings = await prisma.settings.findFirst();
  if (!settings) {
    await prisma.settings.create({
      data: {
        popupDuration: 1,
      },
    });
    console.log('Default settings created');
  }

  // Check if products exist
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    // Create sample products
    const products = [
      { name: 'iPhone 15 Pro', category: 'Смартфоны', price: 99990, stock: 15 },
      { name: 'Samsung Galaxy S24', category: 'Смартфоны', price: 79990, stock: 20 },
      { name: 'MacBook Pro 14"', category: 'Ноутбуки', price: 199990, stock: 8 },
      { name: 'ASUS ROG Phone', category: 'Смартфоны', price: 69990, stock: 12 },
      { name: 'AirPods Pro 2', category: 'Аксессуары', price: 24990, stock: 50 },
      { name: 'iPad Pro 12.9"', category: 'Планшеты', price: 129990, stock: 10 },
      { name: 'Apple Watch Ultra', category: 'Часы', price: 79990, stock: 15 },
      { name: 'Sony PlayStation 5', category: 'Игры', price: 54990, stock: 5 },
      { name: 'Xbox Series X', category: 'Игры', price: 49990, stock: 7 },
      { name: 'Dyson V15', category: 'Бытовая техника', price: 69990, stock: 10 },
    ];

    for (const product of products) {
      await prisma.product.create({ data: product });
    }
    console.log('Sample products created');
  }

  // Initialize bugs from definitions
  const bugCount = await prisma.bug.count();
  if (bugCount === 0) {
    const BUG_DEFINITIONS = [
      { id: 'charles-bug', name: 'Charles Bug', description: 'Пароль "charles" даёт права Visor', category: 'auth', defaultEnabled: true },
      { id: 'power-rangers', name: 'Power Rangers', description: 'Пароль "powerrangers" даёт права Visor', category: 'auth', defaultEnabled: true },
      { id: 'cart-sum-bug', name: 'Ошибка суммы корзины', description: 'Неверный расчёт суммы корзины', category: 'cart', defaultEnabled: true },
      { id: 'missing-address', name: 'Пропавший адрес', description: 'Адрес доставки не сохраняется', category: 'checkout', defaultEnabled: true },
      { id: 'card-duplicate-digit', name: 'Дублирование цифр карты', description: 'Последняя цифра дублируется', category: 'cards', defaultEnabled: true },
      { id: 'card-typo-error', description: 'Опечатки в данных карты', name: 'Опечатки в карте', category: 'cards', defaultEnabled: true },
      { id: 'fake-delete', name: 'Фейковое удаление', description: 'Товары не удаляются реально', category: 'admin', defaultEnabled: true },
    ];

    for (const bug of BUG_DEFINITIONS) {
      await prisma.bug.create({ data: bug });
    }
    console.log('Bug definitions created');
  }

  console.log('Database initialization complete!');
}

main()
  .catch((e) => {
    console.error('Initialization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
