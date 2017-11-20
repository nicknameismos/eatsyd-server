'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Shop = mongoose.model('Shop'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Shop
 */

exports.cookingBeforeCreate = function (req, res, next) {
  req.shop = {
    name: req.body.name,
    address: {
      address: req.body.vicinity,
      lat: req.body.lat,
      lng: req.body.lng
    },
    tel: req.body.phone,
    coverimage: req.body.img,
    importform: req.body.importForm
  };
  next();
};


exports.create = function (req, res) {
  var shop = new Shop(req.shop);
  shop.user = req.user;

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * Show the current Shop
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var shop = req.shop ? req.shop.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  shop.isCurrentUserOwner = req.user && shop.user && shop.user._id.toString() === req.user._id.toString();

  res.jsonp(shop);
};

/**
 * Update a Shop
 */
exports.update = function (req, res) {
  var shop = req.shop;

  shop = _.extend(shop, req.body);

  shop.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * Delete an Shop
 */
exports.delete = function (req, res) {
  var shop = req.shop;

  shop.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(shop);
    }
  });
};

/**
 * List of Shops
 */

exports.cookingListShop = function (req, res, next) {
  Shop.find().exec(function (err, result) {
    if (err) {
      return next(err);
    } else if (!result) {
      return res.status(404).send({
        message: 'No Shop with that identifier has been found'
      });
    }
    req.shops = result;
    next();
  });
};

exports.list = function (req, res) {
  res.jsonp(req.shops);
};

/**
 * Shop middleware
 */
exports.shopByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Shop is invalid'
    });
  }

  Shop.findById(id).populate('user', 'displayName').exec(function (err, shop) {
    if (err) {
      return next(err);
    } else if (!shop) {
      return res.status(404).send({
        message: 'No Shop with that identifier has been found'
      });
    }
    req.shop = shop;
    next();
  });
};
