## Backend API Documentation

### Встановлення та запуск

```bash
# Встановлення залежностей
npm install

# Розробка (з автоперезавантаженням)
npm run dev

# Продакшн
npm start

# Запуск міграцій БД
npm run migrate

# Запуск seed-скрипту
npm run seed
```

### Схема БД

#### Таблиця `Users`
- `id` (INTEGER PRIMARY KEY) — унікальний ідентифікатор
- `name` (TEXT NOT NULL) — ім'я користувача
- `createdAt` (TEXT NOT NULL) — дата створення (ISO 8601)

#### Таблиця `Posts`
- `id` (INTEGER PRIMARY KEY) — унікальний ідентифікатор
- `userId` (INTEGER NOT NULL) — FK на Users, видалення каскадне
- `title` (TEXT NOT NULL) — заголовок поста
- `category` (TEXT NOT NULL) — категорія поста
- `author` (TEXT NOT NULL) — ім'я автора
- `body` (TEXT NOT NULL) — текст поста
- `status` (TEXT NOT NULL DEFAULT 'draft') — статус (draft|published)
- `createdAt` (TEXT NOT NULL) — дата створення (ISO 8601)

#### Таблиця `Comments`
- `id` (INTEGER PRIMARY KEY) — унікальний ідентифікатор
- `postId` (INTEGER NOT NULL) — FK на Posts, видалення каскадне
- `userId` (INTEGER NOT NULL) — FK на Users, видалення забороне
- `body` (TEXT NOT NULL) — текст коментаря
- `createdAt` (TEXT NOT NULL) — дата створення (ISO 8601)

### Зв'язки
- **1:N** — User → Posts (один користувач має багато постів)
- **1:N** — Post → Comments (один пост має багато коментарів)
- **1:N** — User → Comments (один користувач залишив багато коментарів)

### API EndPoints

#### Users
| Метод | Роут | Опис |
|-------|-----|------|
| GET | `/api/users` | Отримати список користувачів (DESC за ID) |
| GET | `/api/users/:id` | Отримати користувача за ID |
| POST | `/api/users` | Створити нового користувача |
| PUT | `/api/users/:id` | Оновити користувача |
| DELETE | `/api/users/:id` | Видалити користувача |

**Приклад POST /api/users:**
```json
{
  "name": "Alice"
}
```

#### Posts
| Метод | Роут | Опис |
|-------|-----|------|
| GET | `/api/posts` | Отримати список постів з фільтрацією, сортуванням і лімітом |
| GET | `/api/posts/:id` | Отримати пост за ID |
| GET | `/api/posts/:id/details` | Отримати пост з пов’язаними даними та кількістю коментарів |
| POST | `/api/posts` | Створити новий пост |
| POST | `/api/posts/with-comment` | Створити пост і початковий коментар послідовно |
| PUT | `/api/posts/:id` | Оновити пост |
| DELETE | `/api/posts/:id` | Видалити пост |

**Параметри запиту для GET /api/posts:**
- `userId=1` — фільтр по автору
- `category=Події|Навчання|Різне` — фільтр по категорії
- `status=published` — фільтр по статусу
- `sort=createdAt|title|id` — сортування (за замовчуванням 'createdAt')
- `order=ASC|DESC` — напрямок сортування (за замовчуванням 'DESC')
- `limit=10` — максимальна кількість записів у відповіді

**Приклад GET /api/posts?userId=1&sort=title&order=ASC&limit=5:**
Повертає до 5 постів користувача 1, сортованих за заголовком в алфавітному порядку.

**Приклад POST /api/posts:**
```json
{
  "userId": 1,
  "title": "Мій перший пост",
  "category": "Події",
  "author": "Alice",
  "body": "Це дуже цікавий текст про щось важливе",
  "status": "published"
}
```

#### Comments
| Метод | Роут | Опис |
|-------|-----|------|
| GET | `/api/comments` | Отримати список коментарів з фільтрацією і сортуванням |
| GET | `/api/comments/:id` | Отримати коментар за ID |
| POST | `/api/comments` | Створити новий коментар |
| PUT | `/api/comments/:id` | Оновити коментар |
| DELETE | `/api/comments/:id` | Видалити коментар |

**Параметри запиту для GET /api/comments:**
- `postId=1` — фільтр по постові
- `userId=2` — фільтр по користувачу
- `sort=createdAt|id` — сортування (за замовчуванням 'createdAt')
- `order=ASC|DESC` — напрямок сортування (за замовчуванням 'DESC')
- `limit=20` — максимальна кількість коментарів у відповіді

**Приклад POST /api/comments:**
```json
{
  "postId": 1,
  "userId": 2,
  "body": "Дуже хороший пост, дякую!"
}
```

### HTTP Коди Стану
- `200 OK` — успішний запит
- `201 Created` — успішне створення
- `204 No Content` — успішне видалення
- `400 Bad Request` — помилка валідації (деталі в полі details)
- `404 Not Found` — ресурс не знайдено
- `500 Internal Server Error` — помилка сервера

### Приклади запитів

#### curl або Postman

**Створення користувача:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob"}'
```

**Отримання постів із фільтрацією:**
```bash
curl http://localhost:3000/api/posts?category=Події&sort=title&order=ASC
```

**Створення коментаря:**
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":1,"userId":2,"body":"Хороший пост!"}'
```

**Отримання посту з деталями:**
```bash
curl http://localhost:3000/api/posts/1/details
```

**Створення поста разом з початковим коментарем:**
```bash
curl -X POST http://localhost:3000/api/posts/with-comment \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"title":"Новий пост","category":"Події","author":"Ivan","body":"Текст поста","commentBody":"Перший коментар"}'
```

**Оновлення статусу поста:**
```bash
curl -X PUT http://localhost:3000/api/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"status":"published"}'
```

### Валідація

- **Users:** name (мін 2 символи)
- **Posts:** title, category, author, body (мін 5 символів), userId обов'язковий
- **Comments:** body (мін 3 символи), postId і userId мають існувати в БД

### Структура проекту

```
src/
├── server.js                  # Точка входу
├── index.js                   # Express app конфігурація
├── app.ts                     # Альтернативна конфігурація (TypeScript)
├── controllers/               # Обробники HTTP запитів
├── services/                  # Бізнес-логіка
├── repositories/              # Доступ до БД
├── routes/                    # Определение маршрутов
├── middleware/                # Middlware (логування, обробка помилок)
└── db/
    ├── db.js                  # SQLite ініціалізація
    ├── dbClient.js            # Promise-обгортки для DB операцій
    ├── migrate.js             # Запуск миграцій
    ├── seed.js                # Заповнення тестових даних
    ├── schema.sql             # Повна схема БД
    └── migrations/            # SQL-файли миграцій
        ├── 001_init.sql       # Створення таблиць
        ├── 002_add_indexes.sql # Додавання індексів
        └── 003_add_status_column.sql # Додавання колонки status

data/
└── app.db                     # SQLite база даних (генерується)
```

### Примітки
- База даних створюється автоматично при першому запуску сервера
- Міграції запускаються автоматично при старті сервера
- Seed-дані можна завантажити командою `npm run seed`
- Усі timestamp'и зберігаються в форматі ISO 8601
- FOREIGN KEY обмеження увімкнено
