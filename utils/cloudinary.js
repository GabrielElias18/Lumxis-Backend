const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
require('dotenv').config();

// Configuración de Cloudinary usando variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Procesa una imagen con Sharp (convierte a WebP y optimiza) y la sube a Cloudinary
 * @param {Buffer} buffer - El buffer de la imagen original
 * @param {String} folder - Carpeta de destino
 * @returns {Promise} - Devuelve el resultado de la subida
 */
const processAndUploadImage = async (buffer, folder = 'lumxis-products') => {
  try {
    // 🧠 Procesar con Sharp: Convertir a WebP, redimensionar si es muy grande y optimizar
    const processedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Tamaño máximo razonable
      .webp({ quality: 80 }) // Convertir a WebP con buena calidad/compresión
      .toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder,
          format: 'webp' // Aseguramos que Cloudinary lo trate como webp
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(processedBuffer);
    });
  } catch (error) {
    throw new Error('Error al procesar la imagen: ' + error.message);
  }
};

/**
 * Sube una imagen a Cloudinary desde un buffer (usado con memoryStorage de multer)
 */
const uploadFromBuffer = (buffer, folder = 'lumxis-products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadFromBuffer,
  processAndUploadImage,
};

