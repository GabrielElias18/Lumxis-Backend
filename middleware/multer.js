// ============================================
// 📁 CONFIGURACIÓN DE MULTER PARA SUBIR IMÁGENES A CLOUDINARY
// ============================================

const multer = require('multer');
const path = require('path');

// ============================================
// 🛡️ FILTRO DE ARCHIVOS PERMITIDOS (solo imágenes)
// ============================================
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};


// ============================================
// 🧠 USAR ALMACENAMIENTO EN MEMORIA
// ============================================
const storage = multer.memoryStorage();

// Exportamos el middleware ya configurado
const upload = multer({ storage, fileFilter });

module.exports = upload;
