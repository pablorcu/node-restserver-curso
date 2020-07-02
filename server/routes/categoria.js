const express = require('express');

let { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort({'descripcion' : 1} )
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            });

        });
});

// ==============================
// Mostrar una categoria por id
// ==============================
app.get('/categoria/:id', verificaToken, (req, res) => {
    //categoria.findById(.....);
    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            caegoria: categoriaDB
        });

    });
});

// ==============================
// Crear nueva categoria
// ==============================
app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoria
    // req.usuario._id
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) => {
        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

// ==============================
// Actualizar la catetoria
// ==============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    //regresa la nueva categoria
    // req.usuario._id
    let id = req.params.id;
    let body = req.body;
    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate( id, descCategoria, {new: true, runValidators: true} ,(err, categoriaDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// ==============================
// Borrado logico de la categoria
// ==============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorias
    // Categoria.findIdByAndRemove
    let id = req.params.id;
    let cambiaEstado = {
        estado: false
    };

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if ( err ) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if ( !categoriaDB ) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        });

    });
    
    /*Usuario.findByIdAndUpdate( id, cambiaEstado, {new: true} ,(err, usuarioBorrado) => {

        if ( err ) {
            return res.status(400).json({
                ok: true,
                err
            });
        }

        if (!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });*/
});




module.exports = app;