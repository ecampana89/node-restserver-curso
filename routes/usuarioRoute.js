const express = require('express')
const constant = require('../commons/constant')
const app = express()

const Usuario = require('../model/usuarioModel')
const {verifyToken, verifyRole} = require('../server/middlewares/auth')

const bcrypt = require('bcrypt')
const _ = require('underscore')

app.get('/usuario', [ verifyToken, verifyRole([ constant.usuario.role.ADMIN_ROLE ]) ], (req, res) => {
    let desde = req.query.desde || 0
    let limite = req.query.limite || 5
    let filters = {}
    if (req.query.estado === 'true') {
        filters.status = true
    } else if (req.query.estado === 'false') {
        filters.status = false
    }
    Usuario.find(filters, {name: 1, email: 1, role: 1, avatar: 1, id: 1, google: 1, status: 1})
        .limit(Number(limite))
        .skip(desde = Number(desde))
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            Usuario.countDocuments(filters, (err, conteo) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }
                return res.json({
                    ok: true,
                    count: conteo,
                    users: usuarios
                })
            })
        })
})

app.post('/usuario', [ verifyToken, verifyRole([ constant.usuario.role.ADMIN_ROLE ]) ], function (req, res) {
    let body = req.body

    let usuario = new Usuario({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        return res.json({
            ok: true,
            user: usuarioDB
        })
    })

})

app.put('/usuario/:id', [ verifyToken, verifyRole([ constant.usuario.role.USER_ROLE, constant.usuario.role.ADMIN_ROLE ]) ], function (req, res) {
    let id = req.params.id
    let body = _.pick(req.body, [ 'name', 'email', 'avatar', 'role', 'status' ])

    Usuario.findByIdAndUpdate(id, body, {new: true, runValidators: true, context: 'query'}, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No existe el usuario'
                }
            })
        }
        return res.json({
            ok: true,
            user: usuarioDB
        })
    })
})

app.delete('/usuario/:id', [ verifyToken, verifyRole([ constant.usuario.role.ADMIN_ROLE ]) ], function (req, res) {
    let id = req.params.id
    Usuario.findByIdAndRemove(id, (err, userDeleted) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!userDeleted) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Usuario no encontrado`,
                    details: [ {key: 'id', value: id} ]
                }
            })
        }
        return res.json({
            ok: true,
            user: userDeleted
        })
    })
})

app.patch('/usuario/:id/delete', [ verifyToken, verifyRole([ constant.usuario.role.USER_ROLE, constant.usuario.role.ADMIN_ROLE ]) ], function (req, res) {
    let id = req.params.id
    Usuario.findByIdAndUpdate(id, {$set: {status: false}}, {
            new: true,
            runValidators: true,
            context: 'query'
        }, (err, userUpdated) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            if (!userUpdated) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: `Usuario no encontrado`,
                        details: [ {key: 'id', value: id} ]
                    }
                })
            }
            return res.json({
                ok: true,
                user: userUpdated
            })
        }
    )
})

module.exports = app
