CREATE TABLE IF NOT EXISTS tenant (
  tenant_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS folder (
  folder_id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  parent_id INT NULL,
  name VARCHAR(255) NOT NULL,
  type ENUM('ROOT', 'OU', 'YEAR', 'SUBJECT', 'CATEGORY') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_folder_tenant FOREIGN KEY (tenant_id) REFERENCES tenant(tenant_id),
  CONSTRAINT fk_folder_parent FOREIGN KEY (parent_id) REFERENCES folder(folder_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role ENUM('ADMIN', 'OU_MANAGER', 'TEACHER', 'MEMBER') NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permission (
  permission_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  folder_id INT NOT NULL,
  level ENUM('READ', 'WRITE', 'OWNER') NOT NULL,
  CONSTRAINT fk_permission_user FOREIGN KEY (user_id) REFERENCES user(user_id),
  CONSTRAINT fk_permission_folder FOREIGN KEY (folder_id) REFERENCES folder(folder_id),
  CONSTRAINT uq_permission_user_folder UNIQUE (user_id, folder_id)
) ENGINE=InnoDB;
