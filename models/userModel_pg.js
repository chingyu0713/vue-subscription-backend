const db = require('../db')

const findUserByGoogleId = async (googleId) => {
  const result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId])
  return result.rows[0]
}

const upsertUser = async (googleId, name, email) => {
  const result = await db.query(`
    INSERT INTO users (google_id, name, email)
    VALUES ($1, $2, $3)
    ON CONFLICT (google_id)
    DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email
    RETURNING *
  `, [googleId, name, email])
  return result.rows[0]
}

const findUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0]
}

const updateSubscription = async (id) => {
  const result = await db.query(
    'UPDATE users SET subscribed = true, subscribed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}

module.exports = { findUserByGoogleId, upsertUser, findUserById, updateSubscription }
