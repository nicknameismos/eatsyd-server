'use strict';

/**
 * Module dependencies
 */
var adsPolicy = require('../policies/ads.server.policy'),
  categoryshops = require('../controllers/categoryshops.server.controller'),
  ads = require('../controllers/ads.server.controller');

module.exports = function (app) {
  // Ads Routes
  app.route('/api/ads').all(core.jwtCheck, adsPolicy.isAllowed)
    .get(ads.list)
    .post(ads.create);

  app.route('/api/ads/:adId').all(core.jwtCheck, adsPolicy.isAllowed)
    .get(ads.read)
    .put(ads.update)
    .delete(ads.delete);

  // Finish by binding the Ad middleware
  app.param('adId', ads.adByID);
};
