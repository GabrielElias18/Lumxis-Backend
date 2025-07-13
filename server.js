// ========================================================
// 📁 SERVER.JS - Archivo principal del servidor
// ========================================================

const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

const sequelize = require('./config/database');

// 🆕 Importar la función para sincronizar la tabla usuarios
const syncUsuarioTable = require('./initializeDatabase');

// Rutas del sistema
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const ingresoRoutes = require('./routes/ventaRoutes');
const egresoRoutes = require('./routes/egresoRoutes');
const clienteRoutes = require('./routes/clientRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const adminRoutes = require('./routes/admin/adminRoutes');

const app = express();

// =======================
// Configuración de CORS
// =======================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// ==========================
// Archivos estáticos
// ==========================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =======================
// Middleware global
// =======================
app.use(bodyParser.json());

// =======================
// Rutas de la API
// =======================
app.use('/api/auth', authRoutes);
app.use('/api/', categoryRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/ventas', ingresoRoutes);
app.use('/api/egresos', egresoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/admin', adminRoutes);

// =======================
// Iniciar servidor
// =======================
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(async () => {
    console.log('✅ Conexión establecida con Sequelize (PostgreSQL)');

    // 🆕 Sincronizar tabla usuarios si no existe
    await syncUsuarioTable();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar con la base de datos:', err);
  });
