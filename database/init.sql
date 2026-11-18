CREATE DATABASE IF NOT EXISTS lab_monitoring_db;
USE lab_monitoring_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'lab_custodian') NOT NULL DEFAULT 'lab_custodian',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pc_units (
  pc_id INT AUTO_INCREMENT PRIMARY KEY,
  pc_number VARCHAR(30) NOT NULL UNIQUE,
  pc_status ENUM('available', 'in_use', 'offline') NOT NULL DEFAULT 'available',
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_logs (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  pc_id INT NOT NULL,
  student_identifier VARCHAR(100),
  time_in DATETIME NOT NULL,
  time_out DATETIME NULL,
  session_status ENUM('active', 'completed') NOT NULL DEFAULT 'active',
  FOREIGN KEY (pc_id) REFERENCES pc_units(pc_id)
);

CREATE TABLE application_logs (
  application_log_id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  application_name VARCHAR(150) NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  duration_seconds INT DEFAULT 0,
  FOREIGN KEY (session_id) REFERENCES session_logs(session_id)
);

INSERT INTO pc_units (pc_number, location) VALUES
('PC-01', 'Computer Laboratory'),
('PC-02', 'Computer Laboratory'),
('PC-03', 'Computer Laboratory'),
('PC-04', 'Computer Laboratory'),
('PC-05', 'Computer Laboratory');