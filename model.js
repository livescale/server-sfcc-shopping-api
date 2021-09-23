/**
 * Configuration.
 */

const clientModel = require('./db/mongo/client');
const tokenModel = require('./db/mongo/token');

/*
 * Methods used by all grant types.
 */

var getAccessToken = function (token, callback) {
  tokenModel
    .findOne({
      accessToken: token,
    })
    .lean()
    .exec(
      function (callback, err, token) {
        if (!token) {
          console.error('Token not found');
        }

        callback(err, token);
      }.bind(null, callback)
    );
};

var getClient = function (clientId, clientSecret, callback) {
  clientModel
    .findOne({
      clientId: clientId,
      clientSecret: clientSecret,
    })
    .lean()
    .exec(
      function (callback, err, client) {
        callback(err, client);
      }.bind(null, callback)
    );
};

var saveToken = function (token, client, user, callback) {
  token.client = {
    id: client.clientId,
  };

  token.user = {
    username: user.username,
  };

  var tokenInstance = new tokenModel(token);
  tokenInstance.save(
    function (callback, err, token) {
      if (!token) {
        console.error('Token not saved');
      } else {
        token = token.toObject();
        delete token._id;
        delete token.__v;
      }

      callback(err, token);
    }.bind(null, callback)
  );
};

/*
 * Method used only by client_credentials grant type.
 */

var getUserFromClient = function (client, callback) {
  clientModel
    .findOne({
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      grants: 'client_credentials',
    })
    .lean()
    .exec(
      function (callback, err, client) {
        callback(err, {
          username: '',
        });
      }.bind(null, callback)
    );
};

/**
 * Export model definition object.
 */

module.exports = {
  getAccessToken: getAccessToken,
  getClient: getClient,
  saveToken: saveToken,
  getUserFromClient: getUserFromClient,
};
