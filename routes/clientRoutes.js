// ======================================================
// 👥 RUTAS PARA GESTIÓN DE CLIENTES
// ======================================================

const express = require('express');

// Importamos las funciones del controlador de clientes
const {
  createClient,
  getClientes,
  updateCliente,
  deleteCliente
} = require('../controllers/clientController');

// Middleware para verificar autenticación por token
const { verificarToken } = require('../middleware/authMiddleware');

// Creamos el enrutador
const router = express.Router();

// ===============================================
// ➕ Crear un nuevo cliente
// ===============================================
// Ruta: POST /api/clientes
router.post('/', verificarToken, createClient);

// ===============================================
// 📄 Obtener todos los clientes
// ===============================================
// Ruta: GET /api/clientes
router.get('/', verificarToken, getClientes);

// ===============================================
// ✏️ Actualizar cliente por ID
// ===============================================
// Ruta: PATCH /api/clientes/:id
router.patch('/:id', verificarToken, updateCliente);

// ===============================================
// 🗑️ Eliminar cliente por ID
// ===============================================
// Ruta: DELETE /api/clientes/:id
router.delete('/:id', verificarToken, deleteCliente);

// Exportamos el router para usarlo en index.js
module.exports = router;
