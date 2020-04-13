const express = require('express');
//paquete para encriptar contrseñas crea encriptaciones de una sola via 
//es decir contraseñas que se encriptan y es imposible desencriptarlas
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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



//configuracion de google
//esta funcion es para verificar que el token enviado desde el front end
//sea valido una vez encuentre que es valida la informacion retornamos todo el payload
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();


    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}





//este es el endpoint que recibe el token de la peticion hecha por el frontend
//una vez tenga el token lo pasa a la funcion que verifica si el token es y la informacion no han sido modificados y es correcto
app.post('/google', async(req, res) => {
    console.log('0');
    let token = req.body.idtoken;

    //en caso de que la informacion haya sido modificada mandamos el error
    let googleUser = await verify(token).catch(e => {
        return res.json({
            ok: false,
            err: 'algo pasa'
        });
    });

    //si no dispara el error es porque todo esta corecto y devolvemos
    //todo el usuario con la info a la base da datos
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        console.log('1');
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(500).json({
                ok: false,
                err
            });
        };

        //verificar si existe o no el usuario que se acaba de loguear
        if (usuarioDB) {
            console.log('2');
            //si el usuario ya se ha autenticado como usuario normal 
            //ya no se puede autenticar como usuario de google

            if (usuarioDB.google === false) {
                if (err) {
                    //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: 'Debe usar su autenticacion normal'
                        }
                    });
                }

                //si se autentico con google entonces debemos renovar el token
                //con jwt personalizado hecho con node
            } else {
                console.log('3');
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            }


        } else {
            console.log('4');
            //si el usuario no existe en nuestra base de datos debemos crearlo
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB) => {
                if (err) {
                    //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                    return res.status(500).json({
                        ok: false,
                        err: {
                            message: 'No se pudo guardar el usuario'
                        }
                    });
                }

                console.log('creando token');
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                });


            });

        };


    });

});








module.exports = app;