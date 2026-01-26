const { pool } = require('../db');

async function findPermissionsByFolder(folderId) {
  const [rows] = await pool.query(
    `SELECT permission.permission_id, permission.level, user.user_id, user.name, user.email, user.role
     FROM permission
     JOIN user ON permission.user_id = user.user_id
     WHERE permission.folder_id = ?
     ORDER BY user.name`,
    [folderId]
  );
  return rows;
}

async function findUserPermissionForFolder(userId, folderId) {
  const [rows] = await pool.query(
    'SELECT * FROM permission WHERE user_id = ? AND folder_id = ?',
    [userId, folderId]
  );
  return rows[0] || null;
}

async function upsertPermission({ userId, folderId, level }) {
  await pool.query(
    `INSERT INTO permission (user_id, folder_id, level)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE level = VALUES(level)`,
    [userId, folderId, level]
  );
}

module.exports = {
  findPermissionsByFolder,
  findUserPermissionForFolder,
  upsertPermission
};
