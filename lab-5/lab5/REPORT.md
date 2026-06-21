# REPORT.md — Лабораторна робота №5: Уразливості і захист

## Таблиця ризиків (вимога «добре»)

| Сценарій | Ризик | Наслідок (без виправлення) | Виправлення |
|---|---|---|---|
| А — SQL Injection | Середній–Високий | Витік всіх постів, маніпуляція результатами SELECT | Параметризований запит (`?`) замість конкатенації |
| Б — XSS (stored) | Середній | Виконання JS/DOM-маніпуляція при перегляді нотаток | DOM API + `textContent` замість `innerHTML` з даними |
| В — IDOR | Високий | Читання/зміна/видалення чужих нотаток за довільним id | `demoAuth` middleware + перевірка `ownerUserId` у кожному SQL-запиті |
| Г — Misconfiguration | Низький–Середній | Витік деталей стека, відсутність захисних заголовків | `securityHeaders` middleware, `IS_DEV` guard у errorHandler |

---

## Сценарій А — SQL Injection

### Де проблема
`src/repositories/posts.repository.js`, функція `getAllPosts`, параметр `search`.

### Було (уразливо)
```js
// КОНКАТЕНАЦІЯ — рядок search стає частиною SQL-коду
const sql = `SELECT * FROM Posts WHERE title LIKE '%${search}%'`;
db.all(sql, callback);
```
Ввід `' OR '1'='1` перетворює запит на:
```sql
SELECT * FROM Posts WHERE title LIKE '%' OR '1'='1%'
```
→ умова `'1'='1` завжди true → повертаються всі записи незалежно від title.

Ввід `'; DROP TABLE Posts; --` потенційно знищує таблицю.

### Відтворення
```
GET /api/v1/posts?search=' OR '1'='1
→ повертає всі пости (замість відфільтрованих)
```

### Виправлення
```js
// src/repositories/posts.repository.js
if (search) {
  conditions.push('title LIKE ?');      // ← SQL-код фіксований
  params.push(`%${search}%`);           // ← значення як дані, не код
}
```
SQLite driver передає `%..%` як рядкове значення — символи `'`, `--` трактуються буквально.

### Перевірка
```
# Нормальний пошук
GET /api/v1/posts?search=Hello
→ { items: [{ id: 1, title: "Hello", ... }] }

# "Шкідливий" ввід
GET /api/v1/posts?search=' OR '1'='1
→ { items: [] }  ← рядок шукається буквально, нічого не знайдено

# Спецсимволи як текст
GET /api/v1/posts?search=%25test%25
→ { items: [] }  ← обробляється як текст, не змінює SQL
```

---

## Сценарій Б — XSS (Stored)

### Де проблема
`app.js`, рендер нотаток — попередня версія використовувала `innerHTML` з даними користувача.

### Було (уразливо)
```js
// НЕБЕЗПЕЧНО: рядок note.content інтерпретується браузером як HTML
notesListContainer.innerHTML += `
  <div class="note-card">
    <h4>${note.title}</h4>
    <p>${note.content}</p>
  </div>`;
```
Якщо зберегти нотатку з content = `<img src=x onerror="alert('XSS')">`,
при наступному завантаженні браузер виконає `alert('XSS')`.

### Відтворення
1. POST `/api/v1/notes` з `content: "<img src=x onerror=alert(1)>"` (X-Demo-UserId: 1)
2. Відкрити сторінку → браузер виконує `alert(1)` при рендері

### Виправлення
```js
// src/app.js — функція renderNotesList
// DOM API: дані ніколи не стають HTML-розміткою
const h4 = document.createElement('h4');
h4.textContent = note.title;     // ← <, > → &lt; &gt; (текст)

const p = document.createElement('p');
p.textContent = note.content;    // ← <img ...> відображається як рядок
```

### Перевірка
Після виправлення `<img src=x onerror=alert(1)>` відображається як текст:
```
<img src=x onerror=alert(1)>
```
а не виконується як код. Нормальний текст нотаток відображається коректно.

---

## Сценарій В — Broken Access Control / IDOR

### Де проблема
Маршрути `/api/v1/notes` без перевірки власника.

### Було (уразливо)
```js
// IDOR: будь-який userId може прочитати чужу нотатку, знаючи id
app.get('/api/v1/notes/:id', (req, res) => {
  db.get('SELECT * FROM Notes WHERE id = ?', [req.params.id], (err, note) => {
    res.json(note);
  });
});
```
```
GET /api/v1/notes/1  з X-Demo-UserId: 2
→ 200 OK { id: 1, ownerUserId: 1, content: "секретна нотатка Alice" }
```
Користувач 2 отримав дані користувача 1.

### Відтворення
```
# Користувач 1 (Alice) створює нотатку
POST /api/v1/notes
X-Demo-UserId: 1
{ "title": "Secret", "content": "My password is 123" }
→ 201 { id: 1, ownerUserId: 1 }

# Користувач 2 (Bob) — до виправлення — читає чужу нотатку
GET /api/v1/notes/1
X-Demo-UserId: 2
→ 200 { id: 1, content: "My password is 123" }  ← IDOR!
```

### Виправлення
**`src/middleware/demoAuth.js`** — middleware перевіряє заголовок `X-Demo-UserId`,
встановлює `req.user.id`. Без валідного заголовка → 401.

**`src/repositories/notes.repository.js`**:
```js
// Перевірка власника в SQL-запиті — один рядок замість двох окремих запитів
db.get(
  'SELECT * FROM Notes WHERE id = ? AND ownerUserId = ?',
  [id, ownerUserId]
)
// Якщо ownerUserId не збігається → row = undefined → 404
```

Перевірка застосована до GET, PUT/PATCH, DELETE.

### Перевірка
```
# Після виправлення: Bob намагається читати нотатку Alice
GET /api/v1/notes/1
X-Demo-UserId: 2
→ 404 { status: 404, title: "NOT_FOUND", detail: "Нотатку не знайдено" }

# Alice читає свою нотатку — працює
GET /api/v1/notes/1
X-Demo-UserId: 1
→ 200 { id: 1, title: "Secret", ... }

# Без заголовка → 401
GET /api/v1/notes/1
→ 401 { status: 401, title: "UNAUTHORIZED", ... }
```

---

## Сценарій Г — Security Misconfiguration

### Де проблема
Відсутні захисні HTTP-заголовки; помилки 500 могли розкривати stack trace.

### Було (уразливо)
```js
// errorHandler.js — стара версія
console.error(err);
res.status(500).json({ error: err.message, stack: err.stack });
// → клієнт бачить шлях до файлів, номери рядків, внутрішні деталі
```

### Виправлення

**`src/middleware/securityHeaders.js`**:
```js
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('Referrer-Policy', 'no-referrer');
```

**`src/middleware/errorHandler.js`**:
```js
const IS_DEV = process.env.NODE_ENV !== 'production';
// ...
console.error('[500]', err);  // ← деталі тільки в логах
res.status(500).json({ status: 500, title: 'INTERNAL_ERROR', detail: 'Внутрішня помилка сервера' });
// У production: жодних stack trace, жодних внутрішніх повідомлень
```

**CORS** (`src/index.js`): обмежено конкретними origin (localhost:5173, localhost:5500),
не `Access-Control-Allow-Origin: *`.

### Перевірка
```bash
curl -I http://localhost:3000/health

# Очікувані заголовки:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
X-Demo-Security: lab5-hardened

# Помилка в production-режимі (NODE_ENV=production):
curl http://localhost:3000/api/v1/posts/999999
→ { "status": 404, "title": "NOT_FOUND", "detail": "Пост не знайдено" }
# Жодних шляхів до файлів, жодного stack trace
```

---

## Підсумок виконаних вимог

| Вимога | Виконано |
|---|---|
| SQLi: відтворення + виправлення параметризацією + перевірка | ✅ |
| IDOR: відтворення + серверна перевірка власника + перевірка | ✅ |
| `X-Demo-UserId` middleware, 401 без заголовка | ✅ |
| `ownerUserId` у сутності Notes, перевірка на бекенді | ✅ |
| Обробка помилок не «падає» з 500 там, де можна 4xx | ✅ |
| XSS: безпечний рендер через DOM API + textContent | ✅ |
| Misconfiguration: безпечні заголовки + приховані dev-деталі | ✅ |
| Централізована обробка помилок (єдиний формат) | ✅ |
| CORS обмежений конкретним origin | ✅ |
| Звіт з таблицею ризик → наслідок → виправлення | ✅ |
