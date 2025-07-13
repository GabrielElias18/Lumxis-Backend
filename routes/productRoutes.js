// ======================================================
// 📦 RUTAS PARA GESTIÓN DE PRODUCTOS E IMÁGENES (Cloudinary)
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
const tenantMiddleware = require('../middleware/tenantMiddleware'); // ✅ Añadido
const upload = require('../middleware/multer'); // ✅ Multer para manejar imágenes

const router = express.Router();

router.post('/', verificarToken, tenantMiddleware, upload.array('imagenes', 5), createProduct);
router.get( '/', verificarToken, tenantMiddleware, getAllProducts);
router.get('/:id', verificarToken, tenantMiddleware, getProductById);
router.put('/:id', verificarToken, tenantMiddleware, upload.array('imagenes', 5), updateProduct);
router.delete('/:id', verificarToken, tenantMiddleware, deleteProduct);

// Exportamos el router para usarlo en server.js o index.js
module.exports = router;
