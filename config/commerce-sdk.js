const axios = require('axios');
const { ClientConfig } = require('commerce-sdk');

const {
  clientId,
  clientPassword,
  organizationId,
  shortCode,
  siteId,
  tenant,
} = require('./env');

exports.getStorefrontConfig = (shopperToken) => {
  const config = new ClientConfig();
  config.headers = {};
  config.parameters = {
    clientId,
    organizationId,
    shortCode,
    siteId,
  };

  config.headers.authorization = shopperToken;

  return config;
};

/*
This admin token is require to request Product informations
*/
exports.getAdminConfig = async () => {
  const data = new URLSearchParams();
  data.append('grant_type', 'client_credentials');
  data.append(
    'scope',
    `SALESFORCE_COMMERCE_API:${tenant} sfcc.catalogs.rw sfcc.products.rw sfcc.orders.rw`
  );

  const response = await axios.request({
    method: 'post',
    url: 'https://account.demandware.com/dwsso/oauth2/access_token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    auth: {
      username: clientId,
      password: clientPassword,
    },
    data,
  });

  const { access_token } = response.data;

  const config = new ClientConfig();
  config.headers = {};
  config.parameters = {
    clientId,
    organizationId,
    shortCode,
    siteId,
  };

  config.headers.authorization = `Bearer ${access_token}`;

  return config;
};
