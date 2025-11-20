// ==========================================
// 📦 CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL
// ==========================================

const { Pool } = require('pg');
require('dotenv').config();

// Pool de conexión con soporte para Render (SSL obligatorio)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
  ssl: {
    rejectUnauthorized: false   // Requerido para Render
  }
});

// Probar conexión
pool.connect()
  .then(() => console.log('✅ Conexión exitosa a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

module.exports = pool;
