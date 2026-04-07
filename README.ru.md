# RPG Helper

## Setup

Перед запуском проекта необходимо подготовить окружение и базу данных.

### 1. Установить зависимости

```bash
bun install
```

### 2. Запустить базу данных

Проект использует PostgreSQL через Docker:

```bash
docker compose up -d
```

После запуска база будет доступна локально.

---

### 3. Настроить переменные окружения

Скопируйте пример `.env` файла:

```bash
mv .env.example .env
```

Откройте `.env` и заполните значения:

```env
DATABASE_URL=postgres://user:password@localhost:5432/rpg_helper
BETTER_AUTH_SECRET=change-me-to-a-random-secret-32-chars-min
BETTER_AUTH_URL=https://localhost:5173
```

#### Описание переменных

* **DATABASE_URL** — подключение к PostgreSQL
* **BETTER_AUTH_SECRET** — секрет для Better Auth (минимум 32 символа)
* **BETTER_AUTH_URL** — URL вашего приложения

---

### 4. Прогнать миграции

После настройки базы выполните:

```bash
bun db:migrate
```

Это создаст все необходимые таблицы.

---

## Developing

После настройки можно запускать dev-сервер:

```bash
bun run dev
```

Или открыть автоматически в браузере:

```bash
bun run dev -- --open
```

По умолчанию приложение будет доступно:

```url
http://localhost:5173
```

---

## Building

Создание production-сборки:

```bash
bun run build
```

Предпросмотр production версии:

```bash
bun run preview
```

---

## Database

Полезные команды:

```bash
# Запустить БД
docker compose up -d

# Остановить БД
docker compose down

# Пересоздать БД
docker compose down -v
docker compose up -d

# Открыть Drizzle DB Studio
bun db:studio

# Установить сиды (тестовые игры, аккаунты и тд)
bun db:seed
```

---

## Requirements

* Bun
* Docker
* Docker Compose
* Node 18+ (опционально, если используешь tooling)

---

## Notes

После первого клонирования порядок действий всегда одинаковый:

```bash
bun install
docker compose up -d
mv .env.example .env
bun db:migrate
bun run dev
```

---

Использованные технологии:

* Svelte / SvelteKit — Фреймворк для фронтенда и full-stack приложений
* Drizzle ORM — Типобезопасный ORM для работы с PostgreSQL
* PostgreSQL — Основная реляционная база данных
* Tailwind CSS — Utility-first CSS фреймворк для стилизации
* Biome — Линтер и форматтер для поддержания качества кода
* Paraglide — Интернационализация (i18n) и локализация
* BetterAuth — Аутентификация и управление сессиями
* Sharp — Высокопроизводительная обработка изображений
