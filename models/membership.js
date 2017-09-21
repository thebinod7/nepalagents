const mongoose = require('mongoose');

const objectId = mongoose.Schema.ObjectId;
const membershipSchema = mongoose.Schema({
    membershiId : objectId,
    userId: {type: objectId, ref: 'Users'},
    memberType : {
        type : String,
        default : 'basic'
    },
    allowedListings : {
        type: Number,
        default: 1
    },
    addedListings : {
        type : Number,
        default : 0
    },
    desc : {
        type : String
    },
    isActive : {
        type : Boolean,
        default : true
    },
    dateAdded : {
        type : Date,
        default: Date.now
    }
});

const Membership = module.exports = mongoose.model('Membership',membershipSchema);
