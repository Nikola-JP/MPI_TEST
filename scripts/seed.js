const dotenv = require('dotenv');
const { pool } = require('../src/db');

dotenv.config();

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [tenantResult] = await connection.query('INSERT INTO tenant (name) VALUES (?)', ['VeleriDrive']);
    const tenantId = tenantResult.insertId;

    const [rootResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, null, 'VeleriDrive', 'ROOT']
    );
    const rootId = rootResult.insertId;

    const [ouResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, rootId, 'OU - Informatika', 'OU']
    );
    const ouId = ouResult.insertId;

    const [yearResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, ouId, '2024/2025', 'YEAR']
    );
    const yearId = yearResult.insertId;

    const [subjectResult] = await connection.query(
      'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
      [tenantId, yearId, 'Predmet - Programiranje', 'SUBJECT']
    );
    const subjectId = subjectResult.insertId;

    const categories = ['01 Materijali', '02 Zadaci', '03 Ispiti', '04 Dokumentacija'];
    let materialsId;
    for (const category of categories) {
      const [categoryResult] = await connection.query(
        'INSERT INTO folder (tenant_id, parent_id, name, type) VALUES (?, ?, ?, ?)',
        [tenantId, subjectId, category, 'CATEGORY']
      );
      if (category === '01 Materijali') {
        materialsId = categoryResult.insertId;
      }
    }

    const [adminResult] = await connection.query(
      'INSERT INTO user (name, email, role) VALUES (?, ?, ?)',
      ['Admin User', 'admin@veleri.hr', 'ADMIN']
    );
    const adminId = adminResult.insertId;

    const [ouManagerResult] = await connection.query(
      'INSERT INTO user (name, email, role) VALUES (?, ?, ?)',
      ['OU Manager', 'ou.manager@veleri.hr', 'OU_MANAGER']
    );
    const ouManagerId = ouManagerResult.insertId;

    const [teacherResult] = await connection.query(
      'INSERT INTO user (name, email, role) VALUES (?, ?, ?)',
      ['Teacher', 'teacher@veleri.hr', 'TEACHER']
    );
    const teacherId = teacherResult.insertId;

    const [memberResult] = await connection.query(
      'INSERT INTO user (name, email, role) VALUES (?, ?, ?)',
      ['Member', 'member@veleri.hr', 'MEMBER']
    );
    const memberId = memberResult.insertId;

    await connection.query(
      'INSERT INTO permission (user_id, folder_id, level) VALUES (?, ?, ?)',
      [adminId, rootId, 'OWNER']
    );
    await connection.query(
      'INSERT INTO permission (user_id, folder_id, level) VALUES (?, ?, ?)',
      [ouManagerId, ouId, 'OWNER']
    );
    await connection.query(
      'INSERT INTO permission (user_id, folder_id, level) VALUES (?, ?, ?)',
      [teacherId, subjectId, 'WRITE']
    );
    await connection.query(
      'INSERT INTO permission (user_id, folder_id, level) VALUES (?, ?, ?)',
      [memberId, materialsId, 'READ']
    );

    await connection.commit();
    console.log('Seed complete');
  } catch (error) {
    await connection.rollback();
    console.error('Seed failed');
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
