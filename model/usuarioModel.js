const moongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');
const constant = require('../commons/constant')

const Schema = moongoose.Schema

let rolesValidos = {
    values: [
        constant.usuario.role.ADMIN_ROLE,
        constant.usuario.role.USER_ROLE ],
    message: '{VALUE} no es un rol valido'
}
let UsuarioSchema = new Schema({
    name: {type: String, required: [ true, 'El nombre es reqerido' ]},
    email: {type: String, required: [ true, 'El email es requerido' ], unique: true},
    password: {type: String, required: [ true, 'La contrasenia es requerida' ]},
    avatar: {type: String, required: false},
    status: {type: Boolean, default: true},
    google: {type: Boolean, required: false},
    role: {type: String, default: constant.usuario.role.USER_ROLE, enum: rolesValidos}
})

UsuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser unico'})

UsuarioSchema.methods.toJSON = function () {
    let user = this
    let userObject = user.toObject()
    userObject.id = userObject._id
    delete userObject._id
    delete userObject.password
    return userObject
}

module.exports = moongoose.model('Usuario', UsuarioSchema, 'users')
