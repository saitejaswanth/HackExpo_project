CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL
);
CREATE TABLE IF NOT EXISTS students (
  roll_no VARCHAR(10) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  dept VARCHAR(10), section VARCHAR(5), year INT,
  attendance INT, math INT, programming INT, dbms INT,
  fee_total INT, fee_paid INT
);
CREATE TABLE IF NOT EXISTS timetable (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day VARCHAR(3), slot VARCHAR(10), subject VARCHAR(50), faculty VARCHAR(50), room VARCHAR(10)
);
