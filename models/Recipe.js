const mongoose = require('mongoose')

const ReceipeSchema = mongoose.Schema({
    id : {
        type: Number   
    },
    name : {
        type: String
    },
    ingredients : [{
       ingrType : {
        type: String
       } 
    }]
})

module.exports = mongoose.model('Recipe', ReceipeSchema)