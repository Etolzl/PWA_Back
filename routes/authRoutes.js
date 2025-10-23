const express = require('express');
const router = express.Router();
const { registrarUsuario, iniciarSesion, obtenerPerfil, obtenerUsuarios } = require('../controllers/authController');

// Ruta para registro de usuarios
router.post('/registro', registrarUsuario);

// Ruta para login de usuarios
router.post('/login', iniciarSesion);

// Ruta para obtener perfil de usuario (para futuras implementaciones)
router.get('/perfil/:id', obtenerPerfil);

// Ruta para obtener lista de usuarios (solo para administradores)
router.get('/usuarios', obtenerUsuarios);

module.exports = router;
