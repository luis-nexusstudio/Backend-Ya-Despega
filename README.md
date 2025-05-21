# Mercado Pago Backend (Node.js)

Este proyecto implementa un backend en **Node.js + Express** que expone un endpoint `/create-preference` para generar preferencias de pago en Mercado Pago. 
Está diseñado para ser consumido por una aplicación iOS que utilice **Checkout Pro**.

## Requisitos

- **Node.js** v14 o superior  
- **npm** (v6+)
- Cuenta de Mercado Pago con tu **Access Token** disponible  

## Instalación

1. Clona este repositorio en tu equipo de trabajo.
2. Crea tu .env e instala los node_modules.
3. El .json se descarga desde firebase en configuración del proyecto en cuentas de servicio.

## Config .env
MP_ACCESS_TOKEN=
PORT=
CURRENCY_ID=
FIREBASE_SERVICE_ACCOUNT=

# Librerias
1. npm install firebase-admin
2. npm npm install express 
3. npm dotenv 
4. npm helmet 
5. npm express-rate-limit 
6. npm morgan 
7. npm hpp 
8. npm xss-clean 
9. npm mercadopago 
10. npm express-validator