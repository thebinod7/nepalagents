const mongoose = require('mongoose');

const objectId = mongoose.Schema.ObjectId;
const propertySchema = mongoose.Schema({
    propertyId : objectId,
    featuredImgUrl : {
        type : String
    },
    title : {
        type: String
    },
    images : { type : Array },
    status : { type : String }, //Sale,Rent
    landSize : { type : String },
    builtArea : { type : String },
    price : { type : Number },
    availability : { type : String }, //3months,6months,9months
    condition : {type: String }, //Excellent,good,fair
    type : { type: String }, //Land,House
    mainRoadDistance : { type: String },
    beds: {type: String },
    baths: {type: Number },
    description: {type: String },
    location : { type : String },
    googleLat : { type : String },
    googleLong : { type : String },
    zone : { type : String },
    garage : { type : String },
    amenities: [{type: String}],
    userId: {type: objectId, ref: 'Users'},
    favoritedBy:[{type: objectId, ref: 'Users'}],
    currentStatus : { type : String, default : 'publish'},
    isActive : {
        type : Boolean,
        default : true
    },
    dateAdded : {
        type : Date,
        default: Date.now
    }
});

const Property = module.exports = mongoose.model('Property',propertySchema);
