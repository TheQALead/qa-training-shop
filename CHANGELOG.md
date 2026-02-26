# QA Training Shop - Working Version 2

## Описание версии

Ветка `working-version-2` содержит исправления для корректной работы Docker-деплоя.

## Отличия от `working-version`

### Исправлены проблемы с Docker:

1. **Restart loop** - изменён `restart: unless-stopped` на `restart: on-failure:5` для предотвращения бесконечного перезапуска

2. **Prisma engine** - добавлены системные библиотеки `openssl` и `libc6-compat` в Alpine контейнер для работы Prisma engine

3. **Инициализация БД** - в CMD добавлен `prisma db push --skip-generate` для создания схемы перед запуском приложения

4. **Health check** - увеличен `start_period` до 60 секунд для корректного запуска

### Исправления от 26.02.2026:

5. **Prisma CLI не найден** - ошибка `sh: prisma: not found` при попытке запуска через npx. Исправлено: установлена глобально `prisma@6.19.2` через `npm install -g prisma@6.19.2` в runner stage

6. **Отсутствующие зависимости Prisma** - ошибка `Cannot find module 'effect'` при запуске prisma из node_modules. Исправлено: глобальная установка prisma CLI решает проблему с зависимостями

## Учетные данные по умолчанию

### Админ:
- **Логин:** Makarov
- **Пароль:** QAAdmin

### Тестовые пользователи:
- `student1` / `pass123` (Student)
- `student2` / `test456` (Student)
- `visor1` / `visor123` (Visor)

## Запуск в Docker

```bash
docker-compose build
docker-compose up -d
```

Приложение будет доступно на порту 3000.
