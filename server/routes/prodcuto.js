const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Producto = require('../models/producto');

//========================================
//Obtener prodcutos
//========================================
app.get('/productos', [verificaToken], (req, res) => {
    //traer todos los productos
    //populate usuario categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 10;
    limite = Number(limite);

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre, email')
        .populate('categoria', 'descripcion')
        .exec((err, productosBD) => {
            if (err) {
                //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productosBD
            });
        })
});




//========================================
//Obtener prodcutos por id
//========================================
app.get('/productos/:id', [verificaToken], (req, res) => {
    //populate usuario categoria

    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre, email')
        .populate('categoria', 'descripcion')
        .exec((err, productoBD) => {
            if (err) {
                //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoBD) {
                return res.status(400).json({
                    ok: false,
                    err: 'producto no encontrado'
                });
            }

            res.json({
                ok: true,
                productoBD
            })
        })
});

app.get('/productos/buscar/:termino', verificaToken, (req, res) => {


    let termino = req.params.termino

    //expresion regular
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            })
        })
})


//========================================
//crear un  prodcuto
//========================================
app.post('/productos', [verificaToken, verificaAdmin_Role], (req, res) => {
    //grbar el usuario
    //grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoBD) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoBD
        })

    });

});


//========================================
//Actualizar prodcuto
//========================================
app.put('/productos/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoBD) => {

        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            productoBD
        })
    })


});


//========================================
//borrar un prodcutos
//========================================
app.delete('/productos/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    //cambiar el estado disponible a false

    let id = req.params.id;

    let cambiarEstado = {
        disponible: false
    }


    //con el metodo findByIdAndRemove buscamos el id que envia la peticion y lo borramos fisicamente de la base de datos
    Producto.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, productoPseudoBorrado) => {
        if (err) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err
            });
        };

        //si no existe un producto con el id eniado en la peticion le especificamos el error al usuario
        if (!productoPseudoBorrado) {
            //estatus 4000 bad request o peticion mal ejecutada y el retunr para que termine la ejecucion
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no encontrado'
                }
            });
        };


        res.json({
            ok: true,
            productoPseudoBorrado,
            message: 'producto borrado'
        })
    })
})



module.exports = app;