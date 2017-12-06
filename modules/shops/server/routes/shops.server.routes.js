'use strict';

/**
 * Module dependencies
 */
var shopsPolicy = require('../policies/shops.server.policy'),
  core = require('../../../core/server/controllers/core.server.controller'),
  shops = require('../controllers/shops.server.controller');

module.exports = function (app) {
  // Shops Routes
  app.route('/api/shops') //.all(shopsPolicy.isAllowed)
    .get(shops.list);

  app.route('/api/shopsnew') //.all(shopsPolicy.isAllowed)
    .get(shops.listShopNew);

  app.route('/api/shops').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .post(shops.create);

  app.route('/api/shops/:shopId') //.all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .get(shops.read);

  app.route('/api/shops/:shopId').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .put(shops.update)
    .delete(shops.delete);

  app.route('/api/shops/createusershop/:shopId').all(core.requiresLoginToken, shopsPolicy.isAllowed)
    .put(shops.createUserByShop, shops.updateUserShop, shops.mailer);

  // app.route('/api/mailtest') //.all(core.requiresLoginToken, shopsPolicy.isAllowed)
  //   .get(shops.mailer);
  // Finish by binding the Shop middleware
  app.param('shopId', shops.shopByID);
};
