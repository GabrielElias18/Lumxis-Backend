// Importamos los módulos necesarios
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config(); // Carga las variables de entorno desde .env
const cors = require('cors');
const path = require('path');

// Conexión a la base de datos PostgreSQL
const pool = require('./config/db');

// Rutas del sistema (importamos cada grupo de rutas)
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const ingresoRoutes = require('./routes/ventaRoutes');
const egresoRoutes = require('./routes/egresoRoutes');
const clienteRoutes = require('./routes/clientRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');

// Inicializamos la aplicación Express
const app = express();

// =======================
// Configuración de CORS
// =======================
app.use(cors({
  origin: '*', // Permitir todas las peticiones (en producción, reemplazar por dominio exacto)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ==========================
// Archivos estáticos (imágenes)
// ==========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// Middleware global
// =======================
// Analizar las peticiones que llegan en formato JSON
app.use(bodyParser.json());

// =======================
// Rutas de la API
// =======================
app.use('/api/auth', authRoutes);           // Autenticación: login, registro, etc.
app.use('/api/', categoryRoutes);           // Categorías de productos
app.use('/api/productos', productRoutes);   // Productos (CRUD)
app.use('/api/ventas', ingresoRoutes);      // Ventas o ingresos
app.use('/api/egresos', egresoRoutes);      // Egresos de inventario
app.use('/api/clientes', clienteRoutes);    // Gestión de clientes
app.use('/api/proveedores', proveedorRoutes); // Gestión de proveedores
app.use('/admin', adminRoutes);             // Funcionalidades administrativas

// =======================
// Iniciar servidor
// =======================
// Obtenemos el puerto desde .env o usamos 3000 por defecto
const PORT = process.env.PORT || 3000;

// Conectamos a PostgreSQL antes de arrancar el servidor
pool.connect()
  .then(() => {
    console.log('✅ Conectado a PostgreSQL');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a PostgreSQL:', err);
  });
