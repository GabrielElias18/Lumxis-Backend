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
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ===============================================
// 📁 CONFIGURACIÓN DE CARGA DE IMÁGENES (multer)
// ===============================================

// Definimos la ruta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, '..', 'uploads');

// Creamos la carpeta 'uploads' si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Carpeta uploads creada');
}

// Configuramos cómo se almacenan los archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Guardar en la carpeta 'uploads'
  },
  filename: (req, file, cb) => {
    // Usar timestamp para evitar archivos con nombres repetidos
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true); // Aceptar el archivo
  } else {
    cb(new Error('Solo se permiten imágenes'), false); // Rechazar el archivo
  }
};

// Creamos la instancia de multer con configuración
const upload = multer({ storage, fileFilter });

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
