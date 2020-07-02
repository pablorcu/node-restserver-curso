const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');

// ============================
// Obtener todos los producto
// ============================
app.get('/producto', verificaToken, (req, res) => {
    // traer todas las categorias
    // populate: usuario, categoria
    // paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({disponible: true},  'nombre precioUni descripcion disponible categoria usuario' )
        .skip(desde)
        .limit(limite)
        .sort({'nombre' : 1} )
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.count({disponible: true}, (err, conteo) => {
                
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });
            

        });
});


// ============================
// Obtener un producto por ID
// ============================
app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario, categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

    
});


// ===========================
//  Buscar productos
// ===========================
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i');

    Producto.find({nombre: regex})
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });
});

// ===========================
//  Crear un nuevo producto
// ===========================
app.post('/producto', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado 

    let body = req.body;

    let producto = new Producto({
        usuario: req.usuario._id,
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });

    });

});


// ============================
// Actualizar un nuevo producto
// ============================
app.put('/producto/:id', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar la categoria
    let id = req.params.id;
    let body = req.body;

    
    Producto.findById(id, (err, productoDB) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.nombre = body.nombre || productoDB.nombre;
        productoDB.precioUni = body.precioUni || productoDB.precioUni;
        productoDB.descripcion = body.descripcion || productoDB.descripcion;
        productoDB.disponible = body.disponible || productoDB.disponible;
        productoDB.categoria = body.categoria || productoDB.categoria;
        

        productoDB.save ( (err, productoGuardado) => {
            
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });

    });
    
});


// ============================
// Borrar un nuevo producto
// ============================
app.delete('/producto/:id', verificaToken, (req, res) => {
    // no lo borra fisicamente sino cambia el disponible
    let id = req.params.id;

    Producto.findById(id, (err, productoDB) => {
        
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if ( !productoDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        productoDB.disponible = false;       

        productoDB.save ( (err, productoBorrado) => {
            
            if ( err ) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoBorrado,
                message: 'Producto borrado'
            });

        });

    });

    
});


module.exports = app;