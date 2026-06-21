-- src/db/migrations/006_add_notes.sql
-- Лабораторна №5 — Сценарій В: IDOR
-- Таблиця особистих нотаток. Кожна нотатка має ownerUserId —
-- поле, що визначає власника ресурсу.
-- Саме це поле є основою для перевірки доступу на бекенді.

CREATE TABLE IF NOT EXISTS Notes (
  id          INTEGER PRIMARY KEY,
  ownerUserId INTEGER NOT NULL,
  title       TEXT    NOT NULL,
  content     TEXT    NOT NULL,
  createdAt   TEXT    NOT NULL,
  FOREIGN KEY (ownerUserId) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_ownerUserId ON Notes(ownerUserId);
