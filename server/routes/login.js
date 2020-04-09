const express = require('express');
//paquete para encriptar contrseñas crea encriptaciones de una sola via 
//es decir contraseñas que se encriptan y es imposible desencriptarlas
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario')
const app = express();



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                message: '(Usuario) o contraseña incorrecto'
            });
        };

        //comparamos la contraseña que puso el usuario con la contraseña que esta en el usaurio
        //que devuelve la peticion que esta en usuarioDB.password
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Usuario o (contraseña) incorrecto'
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

        res.json({
            ok: true,
            Usuario: usuarioDB,
            token
        })
    })

})


module.exports = app;