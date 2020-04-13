const express = require('express');


let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


//========================================
//mostrar todas las categorias
//========================================
app.get('/categoria', (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        //revisa que id hay en la categoria que estou solicitando y carga informacion 
        .populate('usuario', 'nombre email')
        .exec((err, categoriasBD) => {
            if (err) {
                //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            console.log('resp');
            res.json({
                ok: true,
                categoriasBD
            })
        })
})


//========================================
//mostrar categoria por id
//========================================
app.get('/categoria/:id', [verificaToken], (req, res) => {

    let id = req.params.id;
    Categoria.findById(id, (err, categoriaBD) => {


        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(500).json({
                ok: false,
                err
            });
        }


        if (!categoriaBD) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        };


        res.json({
            ok: true,
            categoriaBD
        })


    });
});



//========================================
//crear nueva categoria
//========================================
app.post('/categoria', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body

    //crea una instancia del schema que esta en el modelo categoria es decir una categoria con todas las propiedades definidas en el modelo
    //y le mandamos los parametros que vienen en el body y que son requeridos para crear una categoria nueva
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario
    });

    categoria.save((err, categoriaBD) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaBD
        })
    })



});


//========================================
//actualizar nueva categoria
//========================================
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;

    let body = req.body


    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaActualizada) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaActualizada) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        };

        res.json({
            ok: true,
            categoriaActualizada
        })


    })

});



//========================================
//borrar categoria
//=======================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //solo el rol administrador

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //si no existe una categoria con el id enviado en la peticion le especificamos el error al usuario
        if (!categoriaBorrada) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        };

        res.json({
            ok: true,
            err: {
                message: 'categoria borrada'
            },
            categoriaBorrada
        })



    });
});



module.exports = app;