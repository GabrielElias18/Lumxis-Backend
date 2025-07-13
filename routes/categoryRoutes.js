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

// Importamos middlewares para proteger las rutas y conectar con el tenant
const { verificarToken } = require('../middleware/authMiddleware');
const tenantMiddleware = require('../middleware/tenantMiddleware'); // 👈 NUEVO

const router = express.Router(); // Creamos instancia del enrutador

router.post('/categorias', verificarToken, tenantMiddleware, createCategory);
router.get('/categorias', verificarToken, tenantMiddleware, getCategoriesByUser);
router.put('/categorias/:id', verificarToken, tenantMiddleware, updateCategory);
router.delete('/categorias/:id', verificarToken, tenantMiddleware, deleteCategory);

module.exports = router;
