const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const OAuth2Server = require('oauth2-server');
const MongoStore = require('connect-mongo');
const uriFormat = require('mongodb-uri');

// Here you can get env variable that you set on config/env.js
const {
  port,
  dbUrl,
  clientId,
  organizationId,
  shortCode,
  siteId,
} = require('./config/env');

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
  let unless = new RegExp('/oauth/token|/catalogs|/catalogs/.*', 'i');

  if (unless.test(req.originalUrl)) {
    return next();
  }

  const request = new Request(req);
  const response = new Response(res);

  return app.oauth.authenticate(request, response).then(() => {
    return next();
  });
});

/* This section is use to configure your ecommerce SDK */
const { ClientConfig } = require('commerce-sdk');

const config = new ClientConfig();
config.headers = {};
config.parameters = {
  clientId,
  organizationId,
  shortCode,
  siteId,
};

/* Start of the routes by sections */

require('./routes/authorization')(app);
require('./routes/customer')(app, config);
require('./routes/productManagement')(app, config);
require('./routes/basketManagement')(app, config);

app.listen(port);
console.log('Server running on port: ' + port);
