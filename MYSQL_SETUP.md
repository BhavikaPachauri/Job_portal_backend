# MySQL Setup Guide

## Option 1: Install MySQL Locally

### Windows Installation:
1. Download MySQL Installer from: https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Set root password during installation
4. Add MySQL to your PATH

### After Installation:
```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE jobBackend;

# Verify database exists
SHOW DATABASES;
```

## Option 2: Use XAMPP (Easiest)

1. Download XAMPP from: https://www.apachefriends.org/
2. Install XAMPP
3. Start Apache and MySQL services
4. Access phpMyAdmin at: http://localhost/phpmyadmin
5. Create database named "jobBackend"

## Option 3: Use Online Database (Recommended for Production)

### PlanetScale (Free):
1. Go to https://planetscale.com
2. Create free account
3. Create new database
4. Get connection details

### Update config/config.json:
```json
{
  "development": {
    "username": "your_planetscale_username",
    "password": "your_planetscale_password",
    "database": "jobBackend",
    "host": "your_planetscale_host",
    "dialect": "mysql",
    "ssl": true,
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

## Option 4: Use SQLite (Simplest for Development)

### Install SQLite:
```bash
npm install sqlite3
```

### Update config/config.json:
```json
{
  "development": {
    "username": null,
    "password": null,
    "database": "./database.sqlite",
    "host": null,
    "dialect": "sqlite",
    "storage": "./database.sqlite"
  }
}
```

## Quick Fix for Current Issue:

If you want to continue with local MySQL, try these common passwords:
- Empty password: `"password": null`
- Common passwords: `"password": ""` or `"password": "root"`

Update your config/config.json accordingly. 