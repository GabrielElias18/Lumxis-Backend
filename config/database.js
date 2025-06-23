const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: false,
      underscored: true
    },
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production'
    }
  }
);

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;