const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const OAuth2Server = require('oauth2-server');
const MongoStore = require('connect-mongo');
const uriFormat = require('mongodb-uri');

// Here you can get env variable that you set on config/env.js
const { port, dbUrl } = require('./config/env');

function encodeMongoURI(urlString) {
  if (urlString) {
    let parsed = uriFormat.parse(urlString);
    urlString = uriFormat.format(parsed);
  }
  return urlString;
}

mongoose.connect(
  encodeMongoURI(dbUrl),
  {
    useNewUrlParser: true,
  },
  function (err, res) {
    if (err) {
      return console.error('Error connecting to "%s": "%s"', dbUrl, err);
    }
    console.log('Connected successfully to "%s"', dbUrl);
  }
);

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/*
express-session is used to store sessions in the mongodb
*/
const cookieTtl = 1000 * 60 * 30;
app.use(
  session({
    secret: 'livescale',
    saveUninitialized: true,
    resave: true,
    store: MongoStore.create({
      mongoUrl: encodeMongoURI(dbUrl),
      ttl: cookieTtl,
    }),
  })
);

const { Request, Response } = OAuth2Server;
app.oauth = new OAuth2Server({
  model: require('./model.js'),
});

/*
This function is going to intercept every call except the Authorization call and the Product Management calls 

* /oauth/token

* /catalogs 
* /catalogs/:catalog_id/categories
* /catalogs/:catalog_id/categories/:category_id/products) 

*/

app.use((req, res, next) => {
  let unless = new RegExp(
    '/express-setup|/oauth/token|/catalogs|/catalogs/.*',
    'i'
  );

  if (unless.test(req.originalUrl)) {
    return next();
  }

  const request = new Request(req);
  const response = new Response(res);

  return app.oauth
    .authenticate(request, response)
    .then(() => {
      return next();
    })
    .catch((error) => {
      res
        .status(error.status)
        .send({ status: error.status, message: error.message });

      return next();
    });
});

/* Start of the routes by sections */
const routerV1_0_0 = express.Router();

require('./routes/authorization')(app);
require('./routes/customer')(routerV1_0_0);
require('./routes/productManagement')(routerV1_0_0);
require('./routes/basketManagement')(routerV1_0_0);
require('./routes/customerManagement')(routerV1_0_0);
require('./routes/shipping')(routerV1_0_0);
require('./routes/promotion')(routerV1_0_0);
require('./routes/paymentInformation')(routerV1_0_0);
require('./routes/orderManagement')(routerV1_0_0);

app.use('/v1.0.0', routerV1_0_0);

app.listen(port);
console.log('Server running on port: ' + port);
