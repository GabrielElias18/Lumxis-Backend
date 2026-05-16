// ======================================================
// 📦 RUTAS PARA GESTIÓN DE PRODUCTOS E IMÁGENES
// ======================================================

const express = require('express');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const { verificarToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/multer');

// ===============================================
// 📦 RUTAS PARA PRODUCTOS
// ===============================================

const router = express.Router();

// ➕ Crear un nuevo producto (con imágenes)
router.post('/', verificarToken, upload.array('imagenes', 5), createProduct); // Hasta 5 imágenes

// 📄 Obtener todos los productos
router.get('/', verificarToken, getAllProducts);

// 🔍 Obtener un producto específico por su ID
router.get('/:id', verificarToken, getProductById);

// ✏️ Actualizar un producto (con imágenes opcionales)
router.put('/:id', verificarToken, upload.array('imagenes', 5), updateProduct); // Hasta 5 imágenes

// 🗑️ Eliminar un producto
router.delete('/:id', verificarToken, deleteProduct);

// Exportamos el router para usarlo en index.js
module.exports = router;
