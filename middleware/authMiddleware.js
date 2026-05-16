// ===========================================
// 🔐 MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
// ===========================================

// Importamos jsonwebtoken para verificar y decodificar los tokens JWT
const jwt = require('jsonwebtoken');

// ===========================================
// ✅ Middleware: verificar si el token JWT es válido
// ===========================================
const verificarToken = (req, res, next) => {
  try {
    // Extraemos el token del encabezado Authorization (formato esperado: Bearer <token>)
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Si no hay token, se deniega el acceso
    if (!token) {
      return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó token.' });
    }

    // Verificamos el token usando la clave secreta
    // Si es válido, obtenemos los datos del usuario contenidos en él
    const usuario = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta');

    // Adjuntamos el usuario decodificado al objeto de la petición
    req.usuario = usuario;

    // Continuamos con el siguiente middleware o controlador
    next();
  } catch (error) {
    // Si hay error en la verificación (token inválido o expirado)
    return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
  }
};


// Exportamos los middlewares para usarlos en rutas protegidas
module.exports = {
  verificarToken
};
