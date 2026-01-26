const { pool } = require('../db');

async function findTenantById(tenantId) {
  const [rows] = await pool.query('SELECT * FROM tenant WHERE tenant_id = ?', [tenantId]);
  return rows[0] || null;
}

async function createTenant(name) {
  const [result] = await pool.query('INSERT INTO tenant (name) VALUES (?)', [name]);
  return result.insertId;
}

module.exports = {
  findTenantById,
  createTenant
};
