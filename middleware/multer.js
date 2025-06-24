// ============================================
// 📁 CONFIGURACIÓN DE MULTER PARA SUBIR IMÁGENES
// ============================================

// Importamos multer para la gestión de archivos y path para manejar extensiones
const multer = require('multer');
const path = require('path');

// ============================================
// 📦 CONFIGURAR ALMACENAMIENTO DE ARCHIVOS
// ============================================
const storage = multer.diskStorage({
  // Definimos la carpeta de destino donde se guardarán los archivos
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de que la carpeta 'uploads' exista
  },

  // Definimos cómo se nombrarán los archivos subidos
  filename: (req, file, cb) => {
    // Usamos la fecha actual + extensión original para evitar nombres duplicados
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// ============================================
// 🛡️ FILTRO DE ARCHIVOS PERMITIDOS (solo imágenes)
// ============================================
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const fileTypes = /jpeg|jpg|png|gif/;

  // Verificamos extensión del archivo (por ejemplo: .jpg, .png)
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

  // Verificamos tipo MIME del archivo (por ejemplo: image/jpeg)
  const mimetype = fileTypes.test(file.mimetype);

  // Validamos que cumpla ambas condiciones
  if (extname && mimetype) {
    cb(null, true); // Aceptamos el archivo
  } else {
    cb(new Error('Solo se permiten imágenes'), false); // Rechazamos el archivo
  }
};

// ============================================
// ✨ EXPORTAMOS INSTANCIA DE MULTER CONFIGURADA
// ============================================
// Esta instancia puede usarse como middleware en cualquier ruta que requiera subir imágenes
const upload = multer({ storage, fileFilter });
module.exports = upload;
