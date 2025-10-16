const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const {
  suscribirUsuario,
  desuscribirUsuario,
  enviarNotificacionUsuario,
  enviarNotificacionGlobal,
  verificarSuscripcion,
  obtenerClavesVAPID
} = require('../controllers/pushController');

// Obtener claves VAPID públicas (no requiere autenticación)
router.get('/vapid-keys', obtenerClavesVAPID);

// Rutas que requieren autenticación
router.post('/suscribir', authenticateUser, suscribirUsuario);
router.post('/desuscribir', authenticateUser, desuscribirUsuario);
router.post('/verificar-suscripcion', authenticateUser, verificarSuscripcion);

// Rutas para enviar notificaciones (requieren autenticación)
router.post('/enviar-usuario', authenticateUser, enviarNotificacionUsuario);
router.post('/enviar-global', authenticateUser, enviarNotificacionGlobal);

module.exports = router;
