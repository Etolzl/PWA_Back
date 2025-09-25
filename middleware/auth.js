const User = require('../models/User');

// Middleware simple de autenticación
// En una implementación real, usarías JWT tokens
const authenticateUser = async (req, res, next) => {
  try {
    // Por ahora, vamos a usar un header simple para identificar al usuario
    // En producción, esto debería ser un JWT token
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación requerido'
      });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no válido'
      });
    }

    // Agregar el usuario al request
    req.user = {
      id: user._id,
      nombre: user.nombre,
      correo: user.correo
    };

    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor en autenticación'
    });
  }
};

module.exports = {
  authenticateUser
};
