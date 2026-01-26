# MPI_TEST

Mock OneDrive tenant + drive implementation for the faculty project.

## Features
- Tenant, folder, user, and permission data model stored in MySQL.
- Folder tree template generator for OU/Subject structure.
- Permissions enforcement via `x-user-id` header.
- Minimal OneDrive-style UI with folder tree and permissions table.

## How to run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create the database and schema:
   ```bash
   mysql -h "$DB_HOST" -u "$DB_USER" -p --protocol=TCP "$DB_NAME" < scripts/init_db.sql
   ```
3. Copy and edit env file:
   ```bash
   cp .env.example .env
   ```
4. Seed initial data:
   ```bash
   npm run seed
   ```
5. Start the server:
   ```bash
   npm run dev
   ```
6. Open the UI at `http://localhost:3000`.

## How to configure DB
Set the following values in `.env`:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASS`
- `DB_NAME`

The seed script will create a tenant, root structure, and users with example permissions.
