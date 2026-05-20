const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const REQUIRED_ENV = ['JWT_SECRET', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Variables de entorno faltantes: ${missing.join(', ')}`);
  process.exit(1);
}

const IS_PROD = process.env.NODE_ENV === 'production';

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
const balanceRoutes = require('./routes/balanceRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(helmet());
app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN || (IS_PROD ? false : '*'),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,
  message: { mensaje: 'Demasiados intentos. Espera 15 minutos antes de volver a intentar.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.json({ limit: '10mb' }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/', categoryRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/ventas', ingresoRoutes);
app.use('/api/egresos', egresoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/negocio', negocioRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 3000;

// Sincronizar todas las tablas y luego arrancar el servidor
// En producción no se altera el esquema automáticamente (riesgo de pérdida de datos)
sequelize.sync({ alter: !IS_PROD })
  .then(() => {
    console.log(`✅ Tablas sincronizadas con PostgreSQL [${IS_PROD ? 'producción' : 'desarrollo'}]`);
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al sincronizar tablas:', err);
    process.exit(1);
  });

// Manejador global de errores no capturados
app.use((err, req, res, next) => {
  console.error('Error no capturado:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor.' });
});
