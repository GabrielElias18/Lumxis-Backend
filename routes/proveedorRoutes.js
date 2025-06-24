// ======================================================
// 🏢 RUTAS PARA GESTIÓN DE PROVEEDORES
// ======================================================

const express = require('express');

// Importamos las funciones del controlador de proveedores
const {
  createProveedor,
  getProveedores,
  updateProveedor,
  deleteProveedor
} = require('../controllers/proveedorController');

// Importamos el middleware para verificar el token de autenticación
const { verificarToken } = require('../middleware/authMiddleware');

// Creamos una instancia del router de Express
const router = express.Router();

// ===============================================
// ➕ Crear un nuevo proveedor
// ===============================================
// Ruta: POST /api/proveedores/
router.post('/', verificarToken, createProveedor);

// ===============================================
// 📄 Obtener todos los proveedores
// ===============================================
// Ruta: GET /api/proveedores/
router.get('/', verificarToken, getProveedores);

// ===============================================
// ✏️ Actualizar un proveedor por ID
// ===============================================
// Ruta: PATCH /api/proveedores/:id
router.patch('/:id', verificarToken, updateProveedor);

// ===============================================
// 🗑️ Eliminar un proveedor por ID
// ===============================================
// Ruta: DELETE /api/proveedores/:id
router.delete('/:id', verificarToken, deleteProveedor);

// Exportamos el router para usarlo en index.js
module.exports = router;
