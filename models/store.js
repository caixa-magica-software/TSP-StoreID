'use strict';

const conn = require('./db.js');
const schema = new conn.schema({
  hash: {
    type: String,
    required: true,
  },
  wallet_address: {
    type: String,
    required: true,
    lowercase: true
  },
  document_id: {
    type: String,
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  }
});

schema.index({
  hash: 1,
  wallet_address: 1
},
{
  unique: true
});

const model = conn.model('tsp', schema);

let tsp = {
  getInfoById: function (criteria, callback) {
    return model.findOne(criteria , { '_id': false, '__v': false }, callback);
  },
  addOrUpdateInfo: function (criteria, data, callback) {
    return model.findOneAndUpdate(criteria, { $set : data }, { 'upsert': true, 'new': true }, callback );
  }
}

module.exports = tsp;
