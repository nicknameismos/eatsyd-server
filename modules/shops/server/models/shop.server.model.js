'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Shop Schema
 */
var ShopSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Shop name',
    unique: true,
    trim: true
  },
  name_eng: {
    type: String,
    default: ''
  },
  detail: {
    type: String,
    default: ''
  },
  address: {
    address: String,
    subdistinct: String,
    distinct: String,
    province: String,
    postcode: String,
    lat: String,
    lng: String
  },
  tel: {
    type: String,
    default: ''
  },
  tel2: {
    type: String,
    default: ''
  },
  profileimage: {
    type: String,
    default: ''
  },
  coverimage: {
    type: String,
    default: ''
  },
  isactiveshop: {
    type: Boolean,
    default: false
  },
  importform: {
    type: String,
    default: 'manual'
  },
  timeopen: {
    type: Date,
    default: Date.now
  },
  timeclose: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Shop', ShopSchema);
