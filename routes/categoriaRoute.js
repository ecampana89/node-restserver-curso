const express = require('express')
const mongoose = require('mongoose')
const constant = require('../commons/constant')
const app = express()

const Categoria = require('../model/categoriaModel')
const {verifyToken, verifyRole} = require('../server/middlewares/auth')

const bcrypt = require('bcrypt')
const _ = require('underscore')

let populateOptions = [ {path: 'user', select: 'id name email'} ]

app.get('/categoria', verifyToken, (req, res) => {
    let filters = {}
    if (req.query.user) filters.user = new mongoose.Types.ObjectId(req.query.user)
    if (req.query.descripcion) filters.descripcion = req.query.descripcion

    Categoria.find(filters)
        .populate(populateOptions)
        .sort({descripcion: 1})
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Categoria.countDocuments(filters, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                return res.json({
                    ok: true,
                    count: conteo,
                    categoria: categorias
                })
            })
        })
})

app.get('/categoria/:id', verifyToken, (req, res) => {

    let id = req.params.id
    Categoria.findById(id)
        .populate(populateOptions)
        .exec((err, categoriaDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }
            return res.json({
                ok: true,
                categoria: categoriaDB
            })
        })
})

app.post('/categoria', verifyToken, function (req, res) {
    let body = req.body

    let categoria = new Categoria({
        descripcion: body.descripcion,
        user: req.user.id
    })
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        return res.json({
            ok: true,
            categoria: categoriaDB
        })
    })

})

app.put('/categoria/:id', verifyToken, function (req, res) {
    let id = req.params.id
    let body = _.pick(req.body, [ 'descripcion', 'user' ])

    Categoria.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe la categoria'
                }
            })
        }
        return res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.delete('/categoria/:id', verifyToken, function (req, res) {
    let id = req.params.id
    Categoria.findByIdAndRemove(id, (err, categoriaDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Categoria no encontrado`,
                    details: [ {key: 'id', value: id} ]
                }
            })
        }
        return res.json({
            ok: true,
            categoria: categoriaDeleted
        })
    })
})

app.patch('/categoria/:id/delete', verifyToken, function (req, res) {
    let id = req.params.id
    Categoria.findByIdAndUpdate(id, {$set: {status: false}}, {
            new: true,
            runValidators: true,
            context: 'query'
        }, (err, categoriaUpdated) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (!categoriaUpdated) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `Categoria no encontrada`,
                        details: [ {key: 'id', value: id} ]
                    }
                })
            }
            return res.json({
                ok: true,
                categoria: categoriaUpdated
            })
        }
    )
})

module.exports = app
