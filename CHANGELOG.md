# QA Training Shop - Working Version 2

## Описание версии

Ветка `working-version-2` содержит исправления для корректной работы Docker-деплоя.

## Отличия от `working-version`

### Исправлены проблемы с Docker:

1. **Restart loop** - изменён `restart: unless-stopped` на `restart: on-failure:5` для предотвращения бесконечного перезапуска

2. **Prisma engine** - добавлены системные библиотеки `openssl` и `libc6-compat` в Alpine контейнер

3. **Инициализация БД** - в CMD добавлен `npx prisma db push --skip-generate` для создания схемы перед запуском

4. **Prisma CLI в runtime** - скопирован `node_modules/prisma` для работы `npx prisma`

5. **Health check** - увеличен `start_period` до 60 секунд для корректного запуска

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
