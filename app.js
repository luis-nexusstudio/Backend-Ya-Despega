/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Configuración middlewares globales y registra las rutas de pago 
    -- Update:      
                    
*/

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const paymentRoutes = require('./routes/checkout');
const eventRoutes = require('./routes/events');
const usersRoutes = require('./routes/users');
const notificationsMP = require('./routes/notifications');
const ordersRoutes = require('./routes/orders');
const homeDetailsRoutes = require('./routes/home');
const verificationRoutes = require('./routes/verification'); // 🔐 NUEVO

const app = express();

// Helmet: añade cabeceras de seguridad
app.use(helmet());

// Rate limiting: máximo 100 peticiones por cada IP o limite de 15 minutos
app.use(rateLimit({ windowMs: 15*60*1000, max: 100 }));

// Límite de tamaño de JSON a 100 KB
app.use(express.json({ limit: '100kb' }));

// HPP: evita inyección de parámetros
app.use(hpp());

// Morgan: registra cada petición en consola
app.use(morgan('combined'));

// Endpoint que verifica el estatus del servidor
app.get('/estatusServer', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.use('/api', paymentRoutes);
app.use('/api', eventRoutes);
app.use('/api', usersRoutes);
app.use('/api', notificationsMP);
app.use('/api', ordersRoutes);
app.use('/api', homeDetailsRoutes);
app.use('/api', verificationRoutes); // 🔐 NUEVO


module.exports = app;
