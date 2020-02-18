const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
const Usuario = require('../model/usuarioModel')
const bcrypt = require('bcrypt')
const config = require('../config/defaut')

app.post('/login', function (req, res) {
    let body = req.body

    Usuario.findOne({email: body.email}, (err, usuarioDB) => {
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
                    message: `Usuario o password incorrectas`,
                    details: [ {key: 'email', value: body.email} ]
                }
            })
        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: `Usuario o password incorrectas`,
                    details: [ {key: 'email', value: body.email} ]
                }
            })
        }
        const token = generateToken(usuarioDB)
        res.json({
            ok: true,
            user: usuarioDB,
            token
        })
    })


})

const generateToken = (user) => {
    const payload = {
        id: user.id,
        username: user.email,
        role: user.role,
    }

    return jwt.sign(payload, config.auth.secret, {
        expiresIn: config.auth.tokenExpire
    })
}

module.exports = app
