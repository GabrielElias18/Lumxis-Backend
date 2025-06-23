const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'OrderEasy',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432, // Puerto por defecto de PostgreSQL
});

pool.connect()
  .then(() => console.log('✅ Conexión exitosa a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

module.exports = pool;
