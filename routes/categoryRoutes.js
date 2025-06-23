// routes/categoryRoutes.js
const express = require('express');
const { createCategory, getCategoriesByUser, updateCategory , deleteCategory } = require('../controllers/categoryController');
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/categorias', verificarToken, createCategory); // Crear categoría
router.get('/categorias', verificarToken, getCategoriesByUser); // Obtener categorías
router.put('/categorias/:id', verificarToken, updateCategory); // Editar categoría
router.delete('/categorias/:id', verificarToken, deleteCategory); // Eliminar categoría

module.exports = router;
