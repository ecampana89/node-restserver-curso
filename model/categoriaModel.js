const moongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const uniqueValidator = require('mongoose-unique-validator');
const constant = require('../commons/constant')

const Schema = moongoose.Schema

let CategoriaSchema = new Schema({
    descripcion: {type: String, required: [ true, 'La descripcion es requerida' ]},
    user: { type: Schema.Types.ObjectId, ref: 'Usuario' }
})

CategoriaSchema.plugin(uniqueValidator, {message: '{PATH} debe de ser unico'})

CategoriaSchema.methods.toJSON = function () {
    let categorie = this
    let categorieObject = categorie.toObject()
    categorieObject.id = categorieObject._id
    delete categorieObject._id
    return categorieObject
}

CategoriaSchema.plugin(timestamps, {
    createdAt: 'createdAt',
    updatedAt: 'modifiedAt'
})

module.exports = moongoose.model('Categoria', CategoriaSchema, 'categories')
