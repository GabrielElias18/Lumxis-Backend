// ======================================================
// 📂 RUTAS PARA GESTIÓN DE CATEGORÍAS DE PRODUCTOS
// ======================================================

const express = require('express');

// Importamos las funciones del controlador de categorías
const {
  createCategory,
  getCategoriesByUser,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// Importamos middleware para proteger las rutas
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router(); // Creamos instancia del enrutador

// ===============================================
// ➕ Crear nueva categoría
// ===============================================
// Ruta: POST /api/categorias
// Protegida con token
router.post('/', verificarToken, createCategory);

// ===============================================
// 📄 Obtener todas las categorías del usuario autenticado
// ===============================================
// Ruta: GET /api/categorias
router.get('/', verificarToken, getCategoriesByUser);

// ===============================================
// ✏️ Editar categoría por ID
// ===============================================
// Ruta: PUT /api/categorias/:id
router.put('/:id', verificarToken, updateCategory);

// ===============================================
// 🗑️ Eliminar categoría por ID
// ===============================================
// Ruta: DELETE /api/categorias/:id
router.delete('/:id', verificarToken, deleteCategory);

// Exportamos el enrutador para ser usado en index.js
module.exports = router;
