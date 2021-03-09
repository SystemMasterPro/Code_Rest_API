const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
require('dotenv').config()

const app = express();

// cors
const cors = require('cors');
var corsOptions = {
    origin: '*', // Reemplazar con dominio
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

//capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//conexion a la base de datos
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.cooj3.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true }
)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))


//importar rutas
const authRoutes = require('./routers/auth');
const adminRoutes = require('./routers/admin');
const verifyToken = require('./routers/validate-token');

//ruta middlewares
app.use('/api/user', authRoutes);
app.use('/api/admin', verifyToken, adminRoutes);
app.get('/', (req, res) => {
    res.json({ estado: true, mensaje: 'que hay GENTE' })
});

//iniciar el servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('Estamos en la onda en el puerto ' + PORT);
});