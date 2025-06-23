const express = require('express');
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { verificarToken } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ruta donde se guardarán las imágenes
const uploadDir = path.join(__dirname, '..', 'uploads');

// Crear la carpeta uploads si no existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Carpeta uploads creada');
}

// Configuración de multer para manejar la carga de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Usar la carpeta uploads para guardar las imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Renombrar el archivo con la fecha actual
  }
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true); // Aceptar archivos de imagen
  } else {
    cb(new Error('Solo se permiten imágenes'), false); // Rechazar otros tipos de archivos
  }
};

const upload = multer({ storage, fileFilter });

// Rutas para productos
const router = express.Router();

// Crear un producto (con imágenes)
router.post('/', verificarToken, upload.array('imagenes', 5), createProduct); // Hasta 5 imágenes

// Obtener todos los productos
router.get('/', verificarToken, getAllProducts); 

// Obtener un producto por ID
router.get('/:id', verificarToken, getProductById); 

// Actualizar un producto (con imágenes opcionales)
router.put('/:id', verificarToken, upload.array('imagenes', 5), updateProduct); // Hasta 5 imágenes

// Eliminar un producto
router.delete('/:id', verificarToken, deleteProduct);

module.exports = router;
