const express = require('express')
const fileUpload = require('express-fileupload')
const constants = require('../commons/constant')
const uniqid = require('uniqid')
const Usuario = require('../model/usuarioModel')
const Producto = require('../model/productoModel')
const fs = require('fs')
const path = require('path')
const {verifyToken, verifyRole} = require('../server/middlewares/auth')

const app = express()
// default options
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}))

const deleteArchivos = (nombreImagen, tipo) => {
    let pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${nombreImagen}`)
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen)
    }
}

const uploadProducto = (id, nombreArchivo, res) => {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            deleteArchivos(nombreArchivo, 'productos')
            return res.status(500).json(
                {
                    ok: false,
                    err
                })
        }
        if (!productoDB) {
            deleteArchivos(nombreArchivo, 'productos')
            let errorDetails = [ {key: 'id', value: id} ]
            return res.status(400).json(
                {
                    ok: false,
                    err: {
                        message: 'Producto no existe',
                        errorDetails: errorDetails
                    }
                })
        }
        deleteArchivos(productoDB.img, 'productos')
        productoDB.img = nombreArchivo

        productoDB.save((err, productoUploaded) => {
            res.json({
                ok: true,
                product: productoUploaded,
                img: nombreArchivo
            })
        })
    })
}

const uploadUsuario = (id, nombreArchivo, res) => {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            deleteArchivos(nombreArchivo, 'usuarios')
            return res.status(500).json(
                {
                    ok: false,
                    err
                })
        }
        if (!usuarioDB) {
            deleteArchivos(nombreArchivo, 'usuarios')
            let errorDetails = [ {key: 'id', value: id} ]
            return res.status(400).json(
                {
                    ok: false,
                    err: {
                        message: 'Usuario no existe',
                        errorDetails: errorDetails
                    }
                })
        }

        deleteArchivos(usuarioDB.avatar, 'usuarios')
        usuarioDB.avatar = nombreArchivo

        usuarioDB.save((err, usuarioUploaded) => {
            res.json({
                ok: true,
                user: usuarioUploaded,
                img: nombreArchivo
            })
        })
    })
}

app.put('/upload/:tipo/:id', verifyToken, function (req, res) {

    let tipo = req.params.tipo
    let id = req.params.id

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json(
            {
                ok: false,
                err: {
                    message: 'No files were uploaded.'
                }
            })
    }
    let tiposValidos = [ 'productos', 'usuarios' ]
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json(
            {
                ok: false,
                err: {
                    message: `Tipos permitidos: ${tiposValidos.join(', ')}`,
                    tipoEnviado: tipo
                }
            })
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile

    let extension = sampleFile.name.split('.').pop()
    let extensionesPermitidas = [ 'jpg', 'png', 'gif', 'jpeg' ]
    if (extensionesPermitidas.indexOf(extension) < 0) {
        return res.status(400).json(
            {
                ok: false,
                err: {
                    message: `Tipos permitidos: ${extensionesPermitidas.join(', ')}`,
                    extensionEnviada: extension
                }
            })
    }

    let nombreArchivo = uniqid(id + '-', '.' + extension)

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            })


    })

    if (tipo === constants.archivos.tipos.PRODUCTO) {
        return uploadProducto(id, nombreArchivo, res)
    }
    if (tipo === constants.archivos.tipos.USUARIO) {
        return uploadUsuario(id, nombreArchivo, res)
    }
})

module.exports = app
