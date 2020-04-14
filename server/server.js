require('./config/config');



const express = require('express');
const mongoose = require('mongoose');

var cors = require('cors');

const path = require('path');

const app = express()

//cors
app.use(cors());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});


const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

//confioguracion global de las rutas
app.use(require('./routes/index'));

//habilitar la carpeta public
//para publicar el directorio necesitamos el paquete path para agregar la direcion correctamente
app.use(express.static(path.resolve(__dirname, '../public')));

console.log(path.resolve(path.resolve(__dirname, '../public')));




mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, resp) => {
        if (err) throw err;
        console.log('Base de datos ONLINE');
    });

app.listen(process.env.PORT, () => {
    console.log('Esta escuchando por el puerto', 3000);
})