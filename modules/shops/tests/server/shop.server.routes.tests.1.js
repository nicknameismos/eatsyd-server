'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Shop = mongoose.model('Shop'),
  Categoryshop = mongoose.model('Categoryshop'),
  Categoryproduct = mongoose.model('Categoryproduct'),
  Product = mongoose.model('Product'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  token,
  categoryshop,
  categoryproduct,
  products,
  shop;

/**
 * Shop routes tests
 */
describe('Shop CRUD token tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    categoryproduct = new Categoryproduct({
      name: 'Categoryproduct name',
      priority: 1,
      image: 'dsfasfd',
      user: user
    });

    categoryshop = new Categoryshop({
      name: 'อาหารและเคื่องดื่ม'
    });

    products = new Product({
      name: 'Product name',
      price: 50,
      priorityofcate: 1,
      images: ['https://simg.kapook.com/o/photo/410/kapook_world-408206.jpg', 'https://f.ptcdn.info/408/051/000/oqi6tdf9uS1811y1XHx-o.png'],
      user: user,
      categories: categoryproduct
    });
    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local',
      roles: ['admin']
    });

    token = '';
    // Save a user to the test db and create new Shop
    user.save(function () {
      categoryshop.save(function () {
        categoryproduct.save(function () {

          products.save(function () {

            shop = {
              name: 'Shop name',
              name_eng: 'Shop name english',
              detail: 'Shop Detail',
              tel: '0894447208',
              email: 'followingkon@gmail.com',
              facebook: 'facebook.com',
              line: '@lineid',
              address: {
                address: '77/7',
                addressdetail: 'in font of 7-eleven',
                subdistinct: 'Lumlukka',
                distinct: 'Lumlukka',
                province: 'BKK',
                postcode: '12150',
                lat: '13.9338949',
                lng: '100.6827773'
              },
              items: [{
                cate: categoryproduct,
                products: [products]
              }],
              times: [{
                description: 'all days',
                timestart: '08.00',
                timeend: '20.00',
                days: ['mon', 'thu', 'sun']
              }],
              coverimage: 'https://img.wongnai.com/p/l/2016/11/29/15ff08373d31409fb2f80ebf4623589a.jpg',
              promoteimage: ['http://ed.files-media.com/ud/images/1/22/63943/IMG_7799_Cover.jpg'],
              isactiveshop: false,
              issendmail: false,
              importform: 'manual',
              categories: categoryshop,
              user: user
            };
          });
        });
      });


      agent.post('/api/auth/signin')
        .send(credentials)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }
          signinRes.body.loginToken.should.not.be.empty();
          token = signinRes.body.loginToken;
          done();
        });
    });
  });

  it('should be have Token logged in with token', function (done) {
    token.should.not.be.empty();
    done();
  });

  it('should be able to save a Shop if logged in with token', function (done) {
    // Save a new Product
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Product save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of Products
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle Products save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get Products list
            var shops = shopsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            (shops[0].name).should.match(shop.name);
            // (shops[0]).should.match(1);     


            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get List a Shop if logged in with token', function (done) {
    // Save a new Shops
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle Shops save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of shops
        agent.get('/api/shops')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get shops list
            var shops = shopsGetRes.body;

            // Set assertions
            // (shops).should.match('');

            (shops[0].name).should.match(shop.name);

            // (shops[0].tel).should.match(shop.tel);
            // (shops[0].address).should.match(shop.address);
            // (shops[0].importform).should.match(shop.importform);



            // Call the assertion callback
            done();
          });
      });
  });

  it('should be able to get By ID a Shop if logged in with token', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.get('/api/shops/' + shopSaveRes.body._id)
          // .send(shop)
          // .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            // console.log(JSON.stringify(shopsGetRes.body));
            var shops = shopsGetRes.body;

            // Set assertions
            //(products[0].user.loginToken).should.equal(token);
            shops.should.be.instanceof(Object).and.have.property('name', shop.name);

            done();
          });
      });
  });

  it('should be able to update a Shop if logged in with token', function (done) {
    // Save a new shops
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        shop.name = "test Shop";
        agent.put('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops[0].name).should.match('test Shop');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to delete a Shop if logged in with token', function (done) {
    // Save a new shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        agent.delete('/api/shops/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                var shops = shopsGetRes.body;

                // Set assertions
                //(products[0].user.loginToken).should.equal(token);
                (shops.length).should.match(0);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('is active shop generate user shop with token', function (done) {
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        // shop.isactiveshop = true;
        agent.put('/api/shops/createusershop/' + shopSaveRes.body._id)
          .set('authorization', 'Bearer ' + token)
          .send(shop)
          .expect(200)
          .end(function (shopUpdateErr, shopUpdateRes) {
            // Handle shop save error
            if (shopUpdateErr) {
              return done(shopUpdateErr);
            }
            // Get a list of shop
            agent.get('/api/shops')
              .end(function (shopsGetErr, shopsGetRes) {
                // Handle shop save error
                if (shopsGetErr) {
                  return done(shopsGetErr);
                }

                // Get shop list
                // console.log('new user by shop'+ JSON.stringify(shopsGetRes.body));
                var shops = shopsGetRes.body;

                // Set assertions
                (shops.length).should.match(1);
                (shops[0].issendmail).should.match(true);
                (shops[0].user.firstName).should.match('Shop name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('get category filter', function (done) {

    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        // Get a list of shops
        agent.get('/api/shops/categories')
          .end(function (shopsGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopsGetErr) {
              return done(shopsGetErr);
            }

            // Get shops list
            var shops = shopsGetRes.body;

            // Set assertions

            (shops.filtercate[0].name).should.match('รายการร้านค้า');
            (shops.filtercate[0].items.length).should.match(1);
            (shops.filtercate[1].name).should.match('ร้านค้าใหม่');
            (shops.filtercate[1].items.length).should.match(1);
            (shops.filtercate[2].name).should.match('official');
            (shops.filtercate[2].items.length).should.match(0);
            (shops.filtercate[3].name).should.match('ร้านฝากซื้อ');
            (shops.filtercate[3].items.length).should.match(0);


            // Call the assertion callback
            done();
          });
      });
  });

  it('get shop home with token', function (done) {
    // Save a new Shop
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }
        agent.get('/api/shopshome')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            // Set assertions
            // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
            // coverimage: 'https://img.wongnai.com/p/l/2016/11/29/15ff08373d31409fb2f80ebf4623589a.jpg',
            // promoteimage:
            (shops.coverimage).should.match(shop.coverimage);
            (shops.promoteimage).should.match(shop.promoteimage);
            (shops.items.length).should.match(1);
            (shops.items[0].cate.name).should.match(categoryproduct.name);
            (shops.items[0].products[0].image).should.match(products.images[0]);

            done();
          });
      });
  });


  it('get home admin', function (done) {
    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();
    agent.post('/api/shops')
      .set('authorization', 'Bearer ' + token)
      .send(shop)
      .expect(200)
      .end(function (shopSaveErr, shopSaveRes) {
        // Handle shop save error
        if (shopSaveErr) {
          return done(shopSaveErr);
        }

        agent.get('/api/adminhome')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(function (shopGetErr, shopsGetRes) {
            // Handle shop save error
            if (shopGetErr) {
              return done(shopGetErr);
            }
            // Get shop list
            var shops = shopsGetRes.body;

            // Set assertions
            // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
            (shops.name.length).should.match(4);
            (shops.name[0]).should.match('รายการร้านค้า');
            (shops.pagings.length).should.match(2);
            (shops.pagings[0]).should.match(1);
            (shops.pagings[1]).should.match(2);
            (shops.items.length).should.match(10);
            (shops.items[0].name).should.match('Shop name');
            (shops.items[9].name).should.match('shop09');

            done();
          });
      });
  });


  it('filter current page no keyword', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);

        done();
      });
  });

  it('filter current page no keyword page 2', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: 2,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(2);

        done();
      });
  });

  it('filter current page new created no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop10.created = new Date(2017, 11, 14);
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'ร้านค้าใหม่',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.items[9].name).should.match('shop10');
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page official no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';
    shop1.issendmail = true;
    shop2.issendmail = true;
    shop3.issendmail = true;
    shop4.issendmail = true;
    shop5.issendmail = true;
    shop6.issendmail = true;
    shop7.issendmail = true;
    shop8.issendmail = true;



    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'official',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(8);
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page unofficial no keyword ', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';




    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();


    var data = {
      typename: 'ร้านฝากซื้อ',
      currentpage: null,
      keyword: null
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.pagings.length).should.match(1);


        done();
      });
  });

  it('filter current page keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: null,
      keyword: 's'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(10);
        (shops.pagings.length).should.match(2);

        done();
      });
  });

  it('filter current page keyword page2', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'รายการร้านค้า',
      currentpage: 2,
      keyword: 's'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(2);
        (shops.pagings.length).should.match(2);

        done();
      });
  });

  it('filter current page new created keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop1.created = new Date(2017, 11, 14);
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'ร้านค้าใหม่',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(9);
        (shops.items[8].name).should.match('shop01');
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page official keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';
    shop12.issendmail = true;

    shop1.issendmail = true;
    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'official',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(1);
        (shops.pagings.length).should.match(1);

        done();
      });
  });

  it('filter current page unofficial keyword page1', function (done) {

    var shop1 = new Shop(shop);
    var shop2 = new Shop(shop);
    var shop3 = new Shop(shop);
    var shop4 = new Shop(shop);
    var shop5 = new Shop(shop);
    var shop6 = new Shop(shop);
    var shop7 = new Shop(shop);
    var shop8 = new Shop(shop);
    var shop9 = new Shop(shop);
    var shop10 = new Shop(shop);
    var shop11 = new Shop(shop);
    var shop12 = new Shop(shop);

    shop1.name = 'shop01';
    shop2.name = 'shop02';
    shop3.name = 'shop03';
    shop4.name = 'shop04';
    shop5.name = 'shop05';
    shop6.name = 'shop06';
    shop7.name = 'shop07';
    shop8.name = 'shop08';
    shop9.name = 'shop09';
    shop10.name = 'shop10';
    shop11.name = 'shop11';
    shop12.name = 'shop12';

    shop1.save();
    shop2.save();
    shop3.save();
    shop4.save();
    shop5.save();
    shop6.save();
    shop7.save();
    shop8.save();
    shop9.save();
    shop10.save();
    shop11.save();
    shop12.save();


    var data = {
      typename: 'ร้านฝากซื้อ',
      currentpage: null,
      keyword: 'shop0'
    };
    agent.post('/api/filtershop/')
      .set('authorization', 'Bearer ' + token)
      .send(data)
      .expect(200)
      .end(function (shopGetErr, shopsGetRes) {
        // Handle shop save error
        if (shopGetErr) {
          return done(shopGetErr);
        }
        // Get shop list
        var shops = shopsGetRes.body;

        // Set assertions
        // shops.should.be.instanceof(Object).and.have.property('name', shop.name);
        (shops.items.length).should.match(9);
        (shops.pagings.length).should.match(1);

        done();
      });
  });


  afterEach(function (done) {
    User.remove().exec(function () {
      Categoryshop.remove().exec(function () {
        Categoryproduct.remove().exec(function () {
          Product.remove().exec(function () {
            Shop.remove().exec(done);
          });
        });
      });
    });
  });
});
