PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS Users_new (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL
);

INSERT OR REPLACE INTO Users_new (id, name, createdAt)
SELECT id, name, createdAt FROM Users;

DROP TABLE IF EXISTS Users;
ALTER TABLE Users_new RENAME TO Users;

PRAGMA foreign_keys = ON;
COMMIT;
