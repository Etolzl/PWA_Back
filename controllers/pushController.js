const webpush = require('web-push');
const User = require('../models/User');
const VAPID_KEYS = require('../config/pushKeys');

// Configurar web-push con las claves VAPID
webpush.setVapidDetails(
  'mailto:tu-email@ejemplo.com',
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

// Suscribir usuario a notificaciones push
const suscribirUsuario = async (req, res) => {
  try {
    const { subscription, userAgent } = req.body;
    const userId = req.user.id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Datos de suscripción inválidos'
      });
    }

    // Verificar si ya existe esta suscripción
    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si ya existe esta suscripción
    const suscripcionExistente = usuario.pushSubscriptions.find(
      sub => sub.endpoint === subscription.endpoint
    );

    if (suscripcionExistente) {
      // Actualizar userAgent si es diferente
      if (suscripcionExistente.userAgent !== userAgent) {
        suscripcionExistente.userAgent = userAgent;
        await usuario.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'Suscripción ya existente'
      });
    }

    // Agregar nueva suscripción
    usuario.pushSubscriptions.push({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      userAgent: userAgent || ''
    });

    await usuario.save();

    // Enviar notificación de prueba tras suscripción exitosa
    try {
      const testNotification = await enviarPushAUsuarioInterno({
        userId,
        titulo: '¡Bienvenido a las notificaciones!',
        mensaje: 'Tu suscripción a las notificaciones push se ha activado correctamente. ¡Ya recibirás notificaciones cuando guardes imágenes!',
        url: '/dashboard',
        icono: '/icon.svg'
      });
      
      console.log('Notificación de prueba enviada:', testNotification);
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      // No fallar la suscripción por error en notificación de prueba
    }

    res.status(201).json({
      success: true,
      message: 'Suscripción registrada exitosamente'
    });

  } catch (error) {
    console.error('Error en suscripción push:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Desuscribir usuario de notificaciones push
const desuscribirUsuario = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint de suscripción requerido'
      });
    }

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Remover la suscripción
    usuario.pushSubscriptions = usuario.pushSubscriptions.filter(
      sub => sub.endpoint !== endpoint
    );

    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Suscripción eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en desuscripción push:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Enviar notificación push a un usuario específico
const enviarNotificacionUsuario = async (req, res) => {
  try {
    const { userId, titulo, mensaje, url, icono } = req.body;

    if (!userId || !titulo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'userId, titulo y mensaje son obligatorios'
      });
    }

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!usuario.pushSubscriptions || usuario.pushSubscriptions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Usuario no tiene suscripciones push activas'
      });
    }

    const payload = JSON.stringify({
      title: titulo,
      body: mensaje,
      url: url || '/',
      icon: icono || '/icon.svg',
      badge: '/icon.svg',
      timestamp: Date.now()
    });

    const resultados = [];
    const suscripcionesValidas = [];

    // Enviar a todas las suscripciones del usuario
    for (const subscription of usuario.pushSubscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: subscription.keys
        };

        await webpush.sendNotification(pushSubscription, payload);
        resultados.push({ endpoint: subscription.endpoint, status: 'success' });
        suscripcionesValidas.push(subscription);
      } catch (error) {
        console.error('Error enviando notificación:', error);
        resultados.push({ 
          endpoint: subscription.endpoint, 
          status: 'error', 
          error: error.message 
        });
        
        // Si la suscripción es inválida, la removemos
        if (error.statusCode === 410 || error.statusCode === 404) {
          console.log('Removiendo suscripción inválida:', subscription.endpoint);
        }
      }
    }

    // Actualizar suscripciones válidas (remover las inválidas)
    usuario.pushSubscriptions = suscripcionesValidas;
    await usuario.save();

    res.status(200).json({
      success: true,
      message: 'Notificaciones enviadas',
      data: {
        totalEnviadas: resultados.filter(r => r.status === 'success').length,
        totalErrores: resultados.filter(r => r.status === 'error').length,
        resultados
      }
    });

  } catch (error) {
    console.error('Error enviando notificación push:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Enviar notificación push a todos los usuarios
const enviarNotificacionGlobal = async (req, res) => {
  try {
    const { titulo, mensaje, url, icono } = req.body;

    if (!titulo || !mensaje) {
      return res.status(400).json({
        success: false,
        message: 'titulo y mensaje son obligatorios'
      });
    }

    const usuarios = await User.find({ 
      pushSubscriptions: { $exists: true, $not: { $size: 0 } } 
    });

    if (usuarios.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay usuarios con suscripciones push activas'
      });
    }

    const payload = JSON.stringify({
      title: titulo,
      body: mensaje,
      url: url || '/',
      icon: icono || '/icon.svg',
      badge: '/icon.svg',
      timestamp: Date.now()
    });

    let totalEnviadas = 0;
    let totalErrores = 0;

    // Enviar a todos los usuarios
    for (const usuario of usuarios) {
      const suscripcionesValidas = [];
      
      for (const subscription of usuario.pushSubscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          };

          await webpush.sendNotification(pushSubscription, payload);
          totalEnviadas++;
          suscripcionesValidas.push(subscription);
        } catch (error) {
          console.error('Error enviando notificación global:', error);
          totalErrores++;
          
          // Si la suscripción es inválida, no la incluimos en las válidas
          if (error.statusCode !== 410 && error.statusCode !== 404) {
            suscripcionesValidas.push(subscription);
          }
        }
      }
      
      // Actualizar suscripciones válidas del usuario
      usuario.pushSubscriptions = suscripcionesValidas;
      await usuario.save();
    }

    res.status(200).json({
      success: true,
      message: 'Notificaciones globales enviadas',
      data: {
        usuariosNotificados: usuarios.length,
        totalEnviadas,
        totalErrores
      }
    });

  } catch (error) {
    console.error('Error enviando notificación global:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar si una suscripción existe para un usuario
const verificarSuscripcion = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint de suscripción requerido'
      });
    }

    const usuario = await User.findById(userId);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si existe la suscripción
    const suscripcionExistente = usuario.pushSubscriptions.find(
      sub => sub.endpoint === endpoint
    );

    res.status(200).json({
      success: true,
      data: {
        exists: !!suscripcionExistente,
        subscription: suscripcionExistente || null
      }
    });

  } catch (error) {
    console.error('Error verificando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener claves públicas VAPID
const obtenerClavesVAPID = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      publicKey: VAPID_KEYS.publicKey
    }
  });
};

// Helper interno reutilizable: envía push a todas las suscripciones del usuario
// No usa req/res; retorna un resumen para que el llamador decida qué hacer
const enviarPushAUsuarioInterno = async ({ userId, titulo, mensaje, url, icono }) => {
  if (!userId || !titulo || !mensaje) {
    return { sent: false, totalEnviadas: 0, totalErrores: 0, reason: 'missing_params' };
  }

  const usuario = await User.findById(userId);
  if (!usuario) {
    return { sent: false, totalEnviadas: 0, totalErrores: 0, reason: 'user_not_found' };
  }

  if (!usuario.pushSubscriptions || usuario.pushSubscriptions.length === 0) {
    return { sent: false, totalEnviadas: 0, totalErrores: 0, reason: 'no_subscriptions' };
  }

  const payload = JSON.stringify({
    title: titulo,
    body: mensaje,
    url: url || '/',
    icon: icono || '/icon.svg',
    badge: '/icon.svg',
    timestamp: Date.now()
  });

  let totalEnviadas = 0;
  let totalErrores = 0;
  const suscripcionesValidas = [];

  for (const subscription of usuario.pushSubscriptions) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: subscription.keys
      };
      await webpush.sendNotification(pushSubscription, payload);
      totalEnviadas++;
      suscripcionesValidas.push(subscription);
    } catch (error) {
      totalErrores++;
      // Remover suscripciones inválidas (410/404)
      if (error.statusCode !== 410 && error.statusCode !== 404) {
        suscripcionesValidas.push(subscription);
      }
    }
  }

  // Persistir suscripciones válidas
  usuario.pushSubscriptions = suscripcionesValidas;
  await usuario.save();

  return { sent: totalEnviadas > 0, totalEnviadas, totalErrores };
};

module.exports = {
  suscribirUsuario,
  desuscribirUsuario,
  enviarNotificacionUsuario,
  enviarNotificacionGlobal,
  verificarSuscripcion,
  obtenerClavesVAPID,
  enviarPushAUsuarioInterno
};
