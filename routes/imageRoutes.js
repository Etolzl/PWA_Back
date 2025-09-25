const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  guardarImagen,
  obtenerImagenesGuardadas,
  eliminarImagenGuardada,
  verificarImagenGuardada,
  obtenerEstadisticas
} = require('../controllers/imageController');

// Todas las rutas requieren autenticación
router.use(authenticateUser);

// POST /api/images/save - Guardar una imagen en el perfil del usuario
router.post('/save', guardarImagen);

// GET /api/images/saved - Obtener todas las imágenes guardadas por el usuario
router.get('/saved', obtenerImagenesGuardadas);

// DELETE /api/images/:imageId - Eliminar una imagen guardada
router.delete('/:imageId', eliminarImagenGuardada);

// GET /api/images/check - Verificar si una imagen está guardada por el usuario
router.get('/check', verificarImagenGuardada);

// GET /api/images/stats - Obtener estadísticas de imágenes guardadas
router.get('/stats', obtenerEstadisticas);

module.exports = router;
