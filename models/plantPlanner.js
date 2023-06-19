const mongoose = require('mongoose');

const PlantSchema = mongoose.Schema({
    name :{ 
        type: String,
        required : true
    },
    species : { 
        type: String,
        required : true
    },
    cultivar : { 
        type: String,
        required : true
    },
    isAlive : {
        type :Boolean,
        default: true,
        required :true
    },
    Event : [{
        date : Date,
        eventType : String,
        description : String
    }],
    Harvest : [{
        date : Date,
        weight : Number,
        quantity : Number
    }]
});

module.exports = mongoose.model('Plant',PlantSchema)