const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Conexión Sequelize
const sequelize = require('./config/database');

require('./models/negocioModel');
require('./models/userModel');
require('./models/categoryModel');
require('./models/productModel');
require('./models/ventaModel');
require('./models/ventaDetalleModel');
require('./models/egresoModel');
require('./models/egresoDetalleModel');
require('./models/clientModel');
require('./models/proveedorModel');

// Rutas
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const ingresoRoutes = require('./routes/ventaRoutes');
const egresoRoutes = require('./routes/egresoRoutes');
const clienteRoutes = require('./routes/clientRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const usuariosRoutes = require('./routes/usuariosRoutes');
const negocioRoutes = require('./routes/negocioRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/', categoryRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/ventas', ingresoRoutes);
app.use('/api/egresos', egresoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/negocio', negocioRoutes);

const PORT = process.env.PORT || 3000;

// Sincronizar todas las tablas y luego arrancar el servidor
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Tablas sincronizadas con PostgreSQL');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al sincronizar tablas:', err);
    process.exit(1);
  });
