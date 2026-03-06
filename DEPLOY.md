# BugShop - Docker Deployment

## Быстрый старт

### Сборка и запуск

```bash
# Сборка образа
docker-compose build

# Запуск контейнера
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

### Остановка

```bash
docker-compose down
```

### С пересозданием базы

```bash
# Остановить и удалить том с базой
docker-compose down -v

# Пересобрать и запустить
docker-compose up -d --build
```

## Доступ

После запуска приложение будет доступно на порту 3000.

### Администратор по умолчанию
- **Логин:** admin
- **Пароль:** admin123

⚠️ **Рекомендуется сменить пароль после первого входа!**

## Переменные окружения

Можно переопределить в `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - DATABASE_URL=file:/app/db/custom.db
```

## Структура томов

- `qa-shop-db` — Persist SQLite база данных

## Требования

- Docker 20.10+
- Docker Compose 2.0+

## Health Check

Контейнер автоматически проверяет здоровье каждые 30 секунд через эндпоинт `/api/init`.
