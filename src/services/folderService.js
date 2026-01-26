const { pool } = require('../db');
const folderRepository = require('../repositories/folderRepository');
const permissionRepository = require('../repositories/permissionRepository');

const LEVELS = ['READ', 'WRITE', 'OWNER'];

function compareLevels(level) {
  return LEVELS.indexOf(level);
}

async function requirePermission(userId, folderId, requiredLevel) {
  const permission = await permissionRepository.findUserPermissionForFolder(userId, folderId);
  if (!permission) {
    const error = new Error('Access denied');
    error.status = 403;
    throw error;
  }
  if (compareLevels(permission.level) < compareLevels(requiredLevel)) {
    const error = new Error('Insufficient permissions');
    error.status = 403;
    throw error;
  }
  return permission;
}

async function getRootFolder() {
  return folderRepository.findRootFolder();
}

async function getChildren(folderId) {
  return folderRepository.findChildren(folderId);
}

async function createFolder({ tenantId, parentId, name, type }) {
  return folderRepository.createFolder({ tenantId, parentId, name, type });
}

async function generateTemplate({ tenantId, ouName, academicYear, subjectName }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rootRows] = await connection.query("SELECT * FROM folder WHERE type = 'ROOT' LIMIT 1");
    if (!rootRows[0]) {
      const error = new Error('Root folder not found');
      error.status = 400;
      throw error;
    }
    const root = rootRows[0];

    const [existingOuRows] = await connection.query(
      'SELECT * FROM folder WHERE tenant_id = ? AND parent_id = ? AND name = ?',
      [tenantId, root.folder_id, `OU - ${ouName}`]
    );
    let ouFolderId;
    if (existingOuRows[0]) {
      ouFolderId = existingOuRows[0].folder_id;
    } else {
      const [ouResult] = await connection.query(
        'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
        [tenantId, root.folder_id, `OU - ${ouName}`, 'OU']
      );
      ouFolderId = ouResult.insertId;
    }

    const [yearResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, ouFolderId, academicYear, 'YEAR']
    );
    const yearFolderId = yearResult.insertId;

    const [subjectResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, yearFolderId, `Predmet - ${subjectName}`, 'SUBJECT']
    );
    const subjectFolderId = subjectResult.insertId;

    const categories = ['01 Materijali', '02 Zadaci', '03 Ispiti', '04 Dokumentacija'];
    for (const category of categories) {
      await connection.query(
        'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
        [tenantId, subjectFolderId, category, 'CATEGORY']
      );
    }

    await connection.commit();
    return { rootId: root.folder_id, ouFolderId, yearFolderId, subjectFolderId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getFolderPermissions(folderId) {
  return permissionRepository.findPermissionsByFolder(folderId);
}

async function setFolderPermission({ folderId, userId, level }) {
  if (!LEVELS.includes(level)) {
    const error = new Error('Invalid permission level');
    error.status = 400;
    throw error;
  }
  await permissionRepository.upsertPermission({ userId, folderId, level });
}

module.exports = {
  LEVELS,
  requirePermission,
  getRootFolder,
  getChildren,
  createFolder,
  generateTemplate,
  getFolderPermissions,
  setFolderPermission
};
