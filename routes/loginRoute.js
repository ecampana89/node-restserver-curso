const express = require('express')
const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library');
const app = express()
const Usuario = require('../model/usuarioModel')
const bcrypt = require('bcrypt')
const config = require('../config/defaut')
const client = new OAuth2Client(config.google_client_id);

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

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google_client_id,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const googleUserId = payload['sub'];
    const name = payload['name'];
    const email = payload['email'];
    const picture = payload['picture'];

    return {googleUserId, name, email, picture}
}


app.post('/google', async (req, res) => {
    let token = req.body.idtoken
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        })

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de loguearse con el usuario de CAFE!'
                    }
                })
            } else {
                let token = generateToken(usuarioDB)
                return res.json({
                    ok: true,
                    user: usuarioDB,
                    token

                })
            }
        } else {
            //si el usuario no existe
            let usuario = new Usuario({
                name: googleUser.name,
                email: googleUser.email,
                avatar: googleUser.picture,
                google: true,
                password: googleUser.googleUserId+ '=)'
            })

            usuario.save((err,usuarioDB)=>{
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                let token = generateToken(usuarioDB)
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token

                })
            })
        }
    })
})

module.exports = app
