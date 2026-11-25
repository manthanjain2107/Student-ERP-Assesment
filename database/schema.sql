-- ============================================================================
-- School ERP System - Student Management Module
-- Database Schema (MySQL 8.0+)
--
-- Usage:
--   mysql -u <mysql_user> -p < database/schema.sql
-- ============================================================================

CREATE DATABASE IF NOT EXISTS school_erp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_erp;

CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  admission_number VARCHAR(50) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  section VARCHAR(20) NOT NULL,
  guardian_name VARCHAR(150) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  email VARCHAR(255) NULL,
  address TEXT NOT NULL,
  admission_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT uq_students_admission_number UNIQUE (admission_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes to optimize search and filtering queries
CREATE INDEX idx_students_full_name ON students (full_name);
CREATE INDEX idx_students_class_name ON students (class_name);
CREATE INDEX idx_students_section ON students (section);
CREATE INDEX idx_students_class_section ON students (class_name, section);
