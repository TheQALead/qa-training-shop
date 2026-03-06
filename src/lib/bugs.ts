// Определение всех игровых багов

export interface BugDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryLabel: string;
  defaultEnabled: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  howToFind: string;
}

export const BUG_CATEGORIES = {
  auth: '🔐 Авторизация',
  cart: '🛒 Корзина',
  cards: '💳 Карты',
  order: '📦 Заказы',
  easter: '🥚 Пасхалки',
  ui: '🎨 Интерфейс',
} as const;

export const BUG_DEFINITIONS: BugDefinition[] = [
  {
    id: 'charles-bug',
    name: 'Charles Bug',
    description: 'Frontend добавляет "!" в конец пароля. Для входа нужно перехватить и удалить "!" через Charles.',
    category: 'auth',
    categoryLabel: BUG_CATEGORIES.auth,
    defaultEnabled: false,
    severity: 'high',
    howToFind: 'Через Charles перехватить запрос и удалить "!" из пароля',
  },
  {
    id: 'power-rangers',
    name: 'Power Rangers Easter Egg',
    description: 'Заголовок X-Role: Red Power Ranger даёт Visor права.',
    category: 'easter',
    categoryLabel: BUG_CATEGORIES.easter,
    defaultEnabled: true,
    severity: 'critical',
    howToFind: 'Подменить заголовок X-Role',
  },
  {
    id: 'cart-sum-bug',
    name: 'Баг подсчёта суммы',
    description: 'При нескольких товарах в корзине: если сумма % 10 == 0 → +1000, иначе → +139. При одном товаре сумма верная.',
    category: 'cart',
    categoryLabel: BUG_CATEGORIES.cart,
    defaultEnabled: true,
    severity: 'high',
    howToFind: 'Сравнить реальную сумму с отображаемой при разном количестве товаров',
  },
  {
    id: 'card-duplicate-digit',
    name: 'Дублирование цифры карты',
    description: 'Frontend дублирует последнюю цифру номера карты.',
    category: 'cards',
    categoryLabel: BUG_CATEGORIES.cards,
    defaultEnabled: true,
    severity: 'medium',
    howToFind: 'Проверить номер карты после сохранения',
  },
  {
    id: 'card-typo-error',
    name: 'Орфографическая ошибка',
    description: 'Ошибка "Не верно указаны даные" (пропущена "н").',
    category: 'cards',
    categoryLabel: BUG_CATEGORIES.cards,
    defaultEnabled: true,
    severity: 'low',
    howToFind: 'Создать некорректную карту',
  },
  {
    id: 'fake-delete',
    name: 'Фейковое удаление товара',
    description: 'Frontend удаляет из DOM, но Backend не удаляет из базы.',
    category: 'cart',
    categoryLabel: BUG_CATEGORIES.cart,
    defaultEnabled: true,
    severity: 'high',
    howToFind: 'Удалить товар и перезагрузить страницу',
  },
  {
    id: 'missing-address',
    name: 'Отсутствующий адрес доставки',
    description: 'Сообщение об отправке по адресу, который никто не указывал.',
    category: 'order',
    categoryLabel: BUG_CATEGORIES.order,
    defaultEnabled: true,
    severity: 'medium',
    howToFind: 'Оформить заказ и прочитать сообщение',
  },
  {
    id: 'card-owner-numbers',
    name: 'Цифры в поле Владелец',
    description: 'Поле "Владелец" карты принимает цифры, хотя должно принимать только буквы.',
    category: 'cards',
    categoryLabel: BUG_CATEGORIES.cards,
    defaultEnabled: true,
    severity: 'low',
    howToFind: 'Попробовать ввести цифры в поле Владелец при добавлении карты',
  },
  {
    id: 'uncomfortable-buttons',
    name: 'Неудобное расположение кнопки "Выход" или "Корзина"',
    description: 'Кнопка "Выход" расположена рядом с кнопкой "Корзина", что может привести к случайному нажатию и выходу из системы.',
    category: 'ui',
    categoryLabel: BUG_CATEGORIES.ui,
    defaultEnabled: true,
    severity: 'low',
    howToFind: 'Обратить внимание на расположение кнопок в шапке сайта',
  },
];
