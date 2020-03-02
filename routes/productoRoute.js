const express = require('express')
const mongoose = require('mongoose')
const constant = require('../commons/constant')
const app = express()

const Producto = require('../model/productoModel')
const {verifyToken, verifyRole} = require('../server/middlewares/auth')

const bcrypt = require('bcrypt')
const _ = require('underscore')

let populateOptions = [ {path: 'user', select: 'id name email'},
    {path: 'category', select: 'id descripcion'} ]

app.get('/producto', verifyToken, (req, res) => {
    let desde = req.query.desde || 0
    let limite = req.query.limite || 5
    let filters = {}
    if (req.query.disponible === 'true') {
        filters.disponible = true
    } else if (req.query.disponible === 'false') {
        filters.disponible = false
    }

    Producto.find(filters)
        .populate(populateOptions)
        .limit(Number(limite))
        .skip(desde = Number(desde))
        .sort({descripcion: 1})
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Producto.countDocuments(filters, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                return res.json({
                    ok: true,
                    count: conteo,
                    productos: productos
                })
            })
        })
})

app.get('/producto/:id', verifyToken, (req, res) => {

    let id = req.params.id
    Producto.findById(id)
        .populate(populateOptions)
        .exec((err, productoDB) => {
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
                producto: productoDB
            })
        })
})

app.post('/producto', verifyToken, function (req, res) {
    let body = req.body

    let producto = new Producto({
        name: body.name,
        descripcion: body.descripcion,
        precioUni: body.precioUni,
        disponible: body.disponible,
        category: body.category,
        user: req.user.id
    })
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        return res.json({
            ok: true,
            producto: productoDB
        })
    })

})

app.put('/producto/:id', verifyToken, function (req, res) {
    let id = req.params.id
    let body = _.pick(req.body, [ 'name', 'descripcion', 'user', 'precioUni', 'disponible', 'category' ])

    Producto.findOneAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        return res.json({
            ok: true,
            producto: productoDB
        })
    })
})

app.delete('/producto/:id', verifyToken, function (req, res) {
    let id = req.params.id
    Producto.findByIdAndRemove(id, (err, productoDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!productoDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Producto no encontrado`,
                    details: [ {key: 'id', value: id} ]
                }
            })
        }
        return res.json({
            ok: true,
            producto: productoDeleted
        })
    })
})

app.patch('/producto/:id/delete', verifyToken, function (req, res) {
    let id = req.params.id
    Producto.findByIdAndUpdate(id, {$set: {disponible: false}}, {
            new: true,
            runValidators: true,
            context: 'query'
        }, (err, productoUpdated) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (!productoUpdated) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `Producto no encontrado`,
                        details: [ {key: 'id', value: id} ]
                    }
                })
            }
            return res.json({
                ok: true,
                producto: productoUpdated
            })
        }
    )
})

app.get('/producto/buscar/:termino', verifyToken, (req, res) => {
    let desde = req.query.desde || 0
    let limite = req.query.limite || 5
    let filters = {}
    if (req.query.disponible === 'true') {
        filters.disponible = true
    } else if (req.query.disponible === 'false') {
        filters.disponible = false
    }
    if (req.params.termino) {
        let regex = new RegExp(req.params.termino, 'i')
        filters.$or = [ {name: regex}, {descripcion: regex} ]
    }

    Producto.find(filters)
        .populate(populateOptions)
        .limit(Number(limite))
        .skip(desde = Number(desde))
        .sort({descripcion: 1})
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Producto.countDocuments(filters, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                return res.json({
                    ok: true,
                    count: conteo,
                    productos: productos
                })
            })
        })
})

module.exports = app
