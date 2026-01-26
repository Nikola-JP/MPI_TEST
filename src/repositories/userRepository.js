const { pool } = require('../db');

async function findUserById(userId) {
  const [rows] = await pool.query('SELECT * FROM user WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function createUser({ name, email, role }) {
  const [result] = await pool.query('INSERT INTO user (name, email, role) VALUES (?, ?, ?)', [name, email, role]);
  return result.insertId;
}

module.exports = {
  findUserById,
  createUser
};
