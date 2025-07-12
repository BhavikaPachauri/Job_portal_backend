const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🔧 Setting up database...');
  
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      user: 'root',
      password: null // Try with no password first
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS jobportal');
    console.log('✅ Database "jobportal" created/verified');
    
    // Use the database
    await connection.execute('USE jobportal');
    console.log('✅ Using database "jobportal"');
    
    // Test if we can query
    const [rows] = await connection.execute('SHOW TABLES');
    console.log(`✅ Database is ready. Found ${rows.length} tables`);
    
    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Try these solutions:');
      console.log('1. Install MySQL/XAMPP if not installed');
      console.log('2. Try different password in config/config.json:');
      console.log('   - "password": "" (empty string)');
      console.log('   - "password": "root"');
      console.log('   - "password": "your_actual_password"');
      console.log('3. Or use an online database like PlanetScale');
    }
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase }; 