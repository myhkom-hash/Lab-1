// src/utils/db.js

function buildUpdateQuery(table, id, updates) {
  const fields = [];
  const params = [];

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = ?`);
    params.push(value);
  }

  if (fields.length === 0) {
    return null;
  }

  params.push(Number(id));
  const sql = `UPDATE ${table} SET ${fields.join(', ')} WHERE id = ?;`;
  return { sql, params };
}

module.exports = { buildUpdateQuery };