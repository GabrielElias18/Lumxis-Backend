// ==========================================
// 📦 CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL
// ==========================================

// Importamos 'Pool' desde el paquete 'pg' para manejar múltiples conexiones
const { Pool } = require('pg');

// Cargamos las variables de entorno desde el archivo .env
require('dotenv').config();

// Creamos un nuevo pool de conexiones utilizando las variables de entorno
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',         // Usuario de la base de datos
  host: process.env.DB_HOST || 'localhost',        // Servidor de la base de datos
  database: process.env.DB_NAME || 'OrderEasy',    // Nombre de la base de datos
  password: process.env.DB_PASSWORD || '1234',     // Contraseña del usuario
  port: process.env.DB_PORT || 5432,               // Puerto por defecto de PostgreSQL
});

// Intentamos conectar a la base de datos al iniciar
pool.connect()
  .then(() => console.log('✅ Conexión exitosa a PostgreSQL')) // Mensaje si la conexión fue exitosa
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err)); // Error si falla la conexión

// Exportamos el pool para usarlo en otras partes del proyecto
module.exports = pool;
