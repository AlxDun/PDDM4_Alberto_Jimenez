-- Creating the database
DROP DATABASE IF EXISTS pd_alberto_jimenez_tayrona;
CREATE DATABASE pd_alberto_jimenez_tayrona;
USE pd_alberto_jimenez_tayrona;

-- Clients table
DROP TABLE IF EXISTS clients;
CREATE TABLE clients (
  client_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  identification VARCHAR(50) NOT NULL UNIQUE,
  adress VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(50) NOT NULL UNIQUE
);

-- Billing table
DROP TABLE IF EXISTS billing;
CREATE TABLE billing (
  billing_id VARCHAR(255) NOT NULL  PRIMARY KEY,
  platform VARCHAR(255) NOT NULL,
  period VARCHAR(50) NOT NULL,
  amount_billed INT NOT NULL,
  amount_paid INT NOT NULL
);

-- Transactions table
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
  transaction_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  transaction_date DATETIME NOT NULL,
  transaction_amount INT NOT NULL,
  transaction_state enum('Completada','Pendiente','Fallida') DEFAULT NULL,
  transaction_type VARCHAR(100) NOT NULL,
  client_id INT,
  billing_id VARCHAR(255),
  
  FOREIGN KEY (client_id) REFERENCES clients (client_id) on delete set null on update cascade,
  FOREIGN KEY (billing_id) REFERENCES billing (billing_id) on delete set null on update cascade
);