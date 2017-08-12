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
    googleLong : { type String },
    zone : { type String },
    garage : { type String },
    amenities: [{type: String}],
    userId: {type: ObjectId, ref: 'Users'},
    favoritedBy:[{type: ObjectId, ref: 'Users'}],
    status : { type : String, default : 'draft'},
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
