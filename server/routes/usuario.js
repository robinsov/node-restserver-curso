const express = require('express');
//paquete para encriptar contrseñas crea encriptaciones de una sola via 
//es decir contraseñas que se encriptan y es imposible desencriptarlas
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

//destructuracion para traer solo la funcion que necesito
const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');
const app = express();



//==================================================================================
//                        METODO GET (OBTENER USUARIOS)
//==================================================================================

app.get('/usuario', verificaToken, (req, res) => {

    //pruebra para darnos cuenta que todo el usuario ya viene en el req o peticion 
    //porque el verificaToken ya me trae toda la informacion del usuario (payload)
    // return res.json({
    //     usuario: req.usuario
    // })

    //los parametros opcionales se guardan en la peticion o req.query
    //si el parametro desde no viene ponemos por defecto 0
    let desde = req.query.desde || 0;
    desde = Number(desde);

    //asi controlo cuantos quiero por pagina
    let limite = req.query.limite || 5;
    limite = Number(limite);



    //es segundo parametro que recibe el find es lo que quiero mostrar del usuario
    //asi puedo excluir lo que no quier ver
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        // .skip(desde)
        // //limit se utiliza para paginar los resultados para que no salgan todos los registros juntos
        // .limit(limite)
        //ejecuta la peticion y devuelve los usuarios o un error en caso de suceder
        .exec((err, usuarios) => {
            if (err) {
                //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.count({ estado: true }, (err, conteo) => {
                //devuelve la respuesta si no retorna ningun error 
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            })

        })
})


//==================================================================================
//                        METODO POST (CREAR USUARIO)
//==================================================================================
app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    //el body contiene toda la informacion que envia el usuario 
    let body = req.body;

    //crea una instancia del schema que esta en el modelo usuario es decir un usuario con todas las propiedades definidas en el modelo
    //y le mandamos los parametros que vienen en el body y que son requeridos para crear un usuario nuevo
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //encriptamos la contraseña con el paquete bcrypt de modo asincrono y le pasamos una semilla
        //el 10 hace refrencia a la cantida de vueltas que hace el paquete para encriptar
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    //la palabra reservada save se utiliza para guardar en la base de datos de mongo y tiene un callback 
    //uno es el erro en caso de que suceda algo al conectar con la base de datos y el otro es el usuario en caso de que guarde correctamente
    usuario.save((err, usuarioBD) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //una vez haya guardado y ya me haya devuelto el usuarioBD hacemos null la contraseña
        //con el fin de que nadie la tenga ni siquiera el usuario final porque no le sirve de nada
        usuarioBD.password = null;

        //en caso de que no se dispare el return quire decir que todo lo hizo conrrectamente. en ese caso
        //mongo devuelve el usuario en este caso el usuarioBD y se lo pasamos a la respuesta
        //con un ok para dar por hecho que todo salio bien 
        res.json({
            ok: true,
            usuario: usuarioBD
        });


    });

})


//==================================================================================
//                        METODO PUT (ACTUALIZAR USUARIO)
//==================================================================================

app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;
    //el paquete pick de underscore le decimos al body que es lo que podemos actualizar los demas campos quedan intactos auque el usuario intente cambiarlos
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    //el metodo findByIdAndUpdate recibe varias opciones una de ellas es
    //new: true/false eso para que retorne el usuario actualizada a la respuesta
    //runValidators: true/false para que corra las validaciones que tiene el esquema
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioBD) => {

        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBD
        })
    })



});


// ==================================================================================
//                        METODO DELETE (BORRAR USUARIO)
// ==================================================================================

app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    //con el metodo findByIdAndRemove buscamos el id que envia la peticion y lo borramos fisicamente de la base de datos
    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        };

        //si no existe un usuario con el id eniado en la peticion le especificamos el error al usuario
        if (!usuarioBorrado) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        };

        res.json({
            ok: true,
            usuarioBorrado
        })
    })
});




//==================================================================================
//                        METODO DELETE ("BORRAR" USUARIO)
//==================================================================================

// app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

//     let id = req.params.id;

//     let cambiarEstado = {
//         estado: false
//     }


//     //con el metodo findByIdAndRemove buscamos el id que envia la peticion y lo borramos fisicamente de la base de datos
//     Usuario.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, usuarioPseudoBorrado) => {
//         if (err) {
//             //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
//             return res.status(400).json({
//                 ok: false,
//                 err
//             });
//         };

//         //si no existe un usuario con el id eniado en la peticion le especificamos el error al usuario
//         if (!usuarioPseudoBorrado) {
//             //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         };


//         res.json({
//             ok: true,
//             usuario: usuarioPseudoBorrado
//         })
//     })
// });




module.exports = app;