const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');

const path = require('path');

app.use(fileUpload());
//app.use(fileUpload({ useTempFiles: true }));



app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    //si no se ha seleccionado ningun archivo enviamos el error al usuario
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'no se ha selecionado ningun archivo'
            }
        });

    }

    //validar tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'los tipos permitidos son: ' + tiposValidos.join(', ')
            },
            ext: tipo
        });
    }

    console.log('go');
    // extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // sino dispara el error quiere decir que si hay un archivo en tal caso 
    // lo guardamos en una variable y la tomamos de req.files.archivo
    let archivo = req.files.archivo;

    // sacamos la extension separando el nombre por puntos con la funcion split
    let nombreCortado = archivo.name.split('.');

    //guardamos la extension en una variable
    let extension = nombreCortado[nombreCortado.length - 1];

    //validamos si efectivamente el archivo tiene extension permitida
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'las extensiones permitidas son ' + extensionesValidas.join(', ')
            },
            ext: extension
        });
    }

    //cambiar nombre al archivo para que sea unico y prevenir cache del navegador
    let nombreArchivo = `${ id }-${new Date().getMilliseconds()}.${ extension }`

    // movemos el archivo a algun lugar de la aplicacion en este caso a la carpeta 
    // uploads
    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        console.log('go2', tipo, id, nombreArchivo);
        //aqui ya la imagen esta cargada

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

    });
});


function imagenUsuario(id, res, nombreArchivo) {
    console.log('go3');
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {

            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            });
        }

        console.log('go4');

        if (!usuarioBD) {
            borraArchivo(nombreArchivo, 'usuarios')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'usuario no existe'
                }
            });
        }

        borraArchivo(usuarioBD.img, 'usuarios')



        console.log('go5');
        usuarioBD.img = nombreArchivo;


        usuarioBD.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });

    });
}


function imagenProducto(id, res, nombreArchivo) {

    console.log('go3');
    Producto.findById(id, (err, productoBD) => {
        if (err) {

            borraArchivo(nombreArchivo, 'productos')
            return res.status(500).json({
                ok: false,
                err
            });
        }

        console.log('go4');

        if (!productoBD) {
            borraArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'producto no existe'
                }
            });
        }

        borraArchivo(productoBD.img, 'productos')



        console.log('go5');
        productoBD.img = nombreArchivo;


        productoBD.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });

    });

}


function borraArchivo(nombreImagen, tipo) {

    // como cada usuario no puede o no debe tener mas de una imagen
    // rsolvemos haciendo uso de fs (file system) y path que permite 
    // saber si existe ya una imagen en la ruta especificada de ser asi 
    // se elimina la que ya existe y se reemplaza por la nueva
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${ nombreImagen }`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;