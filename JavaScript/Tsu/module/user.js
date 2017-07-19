var Schema = require('mongoose').Schema;

module.exports = {
username: { type: String, lowercase: true, unique: true },
hash: String,
salt: String,
email:      {type: String, lowercase: true},
firstName:  {type: String, lowercase: true},
lastName:   {type: String, lowercase: true},
title:      {type: String, lowercase: true},
profileImage: {type: String, lowercase: true},
connectionId: {type: String},
device :  {type: Number},
connected:   {type: Boolean, default: false },
contacts: [{ type: Schema.Types.ObjectId}],
createdAt : { type: Date, default: Date.now},
modifiedDate : { type: Date, default: Date.now},
};
