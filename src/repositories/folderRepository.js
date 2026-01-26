const { pool } = require('../db');

async function findRootFolder() {
  const [rows] = await pool.query("SELECT * FROM folder WHERE type = 'ROOT' LIMIT 1");
  return rows[0] || null;
}

async function findFolderById(folderId) {
  const [rows] = await pool.query('SELECT * FROM folder WHERE folder_id = ?', [folderId]);
  return rows[0] || null;
}

async function findChildren(folderId) {
  const [rows] = await pool.query('SELECT * FROM folder WHERE parent_id = ? ORDER BY name', [folderId]);
  return rows;
}

async function createFolder({ tenantId, parentId, name, type }) {
  const [result] = await pool.query(
    'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
    [tenantId, parentId, name, type]
  );
  return result.insertId;
}

async function findFolderByNameAndParent({ tenantId, parentId, name }) {
  const [rows] = await pool.query(
    'SELECT * FROM folder WHERE tenant_id = ? AND parent_id <=> ? AND name = ?',
    [tenantId, parentId, name]
  );
  return rows[0] || null;
}

module.exports = {
  findRootFolder,
  findFolderById,
  findChildren,
  createFolder,
  findFolderByNameAndParent
};
