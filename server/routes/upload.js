const express = require('express');
const fileUpload = require('express-fileupload');

const Usuario = require('../models/usuario');
let Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

const app = express();

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'No se ha seleccionado ningún archivo'
                    }
        });
    }

    //Validar tipo
    let tiposValidas = ['usuarios','productos'];

    if ( tiposValidas.indexOf( tipo ) < 0 ){
        return res.status(400)
        .json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidas.join(', '),
                tipo: tipo
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];
    
    //Extensiones permitidas
    let extencionesValidas = ['png','jpg','gif','jpeg'];
    
    if ( extencionesValidas.indexOf( extension) < 0 ){
        return res.status(400)
        .json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extencionesValidas.join(', '),
                ext: extension
            }
        });
    }
    
    // puesto por mi para no permitir archivos mayor a los megabytes (dividir para 1000000 de bits a kb)
    // foto perfil maximo 2Mb
    // foto producto maximo 5Mb
    // para web maximo 15Mb


    let tamanioArchvio = archivo.size / 1000000;
    if (tipo === 'usuarios'){
        
        if (tamanioArchvio > 2){
            return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'El tamaño del archivo para foto de perfil excede el permitido de 2Mb',
                    size: tamanioArchvio
                }
            });
        }

    } else {

        if (tamanioArchvio > 5){
            return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'El tamaño del archivo para foto del producto excede el permitido de 5Mb',
                    size: tamanioArchvio
                }
            });
        }

    }

    //cambiar nombre al archivo
    // formato ejemplo: 123asdf212-123.jpg
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;


    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, function(err) {
        if (err)
        return res.status(500).json({
            ok: false,
              err
          });
    
        // Aqui, imagen ya es cargada
        if (tipo === 'usuarios'){
            imagenUsuairo(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // });

      });
    

});

function imagenUsuairo(id, res, nombreArchivo){

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchvo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchvo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        borraArchvo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;
        
        usuarioDB.save((err, usuarioGrabado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            
            res.json({
                ok: true,
                usuario: usuarioGrabado,
                img: nombreArchivo
            });
        });
        
        
    });
};


function imagenProducto(id, res, nombreArchivo){
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchvo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchvo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no existe'
                }
            });
        }

        borraArchvo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGrabado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            
            res.json({
                ok: true,
                producto: productoGrabado,
                img: nombreArchivo
            });
        });
    });
};

function borraArchvo(nombreImagen, tipo){
    
    let pathImage = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    
    if (fs.existsSync(pathImage)){
        fs.unlinkSync(pathImage);
    }

};

module.exports = app;