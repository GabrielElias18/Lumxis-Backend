// ============================================
// 📁 CONFIGURACIÓN DE MULTER PARA SUBIR IMÁGENES A CLOUDINARY
// ============================================

const multer = require('multer');
const path = require('path');

// ============================================
// 🛡️ FILTRO DE ARCHIVOS PERMITIDOS (solo imágenes)
// ============================================
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
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
