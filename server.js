/*
    -- Author:	Luis Melendez
    -- Create date: 08/05/2024
    -- Update date: 
    -- Description:	Carga variables de entorno e inicia el servidor
    -- Update:      
                    
*/

require('dotenv').config(); 
const app = require('./app');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
