const dotenv = require('dotenv');
const result = dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

if (result.error) {
  throw result.error;
}

const { parsed: envs } = result;

module.exports = {
  port: envs.PORT,
  dbUrl: envs.dbUrl,
  clientId: envs.CLIENT_ID,
  clientPassword: envs.CLIENT_PASSWORD,
  organizationId: envs.ORGANIZATION_ID,
  tenant: envs.TENANT,
  shortCode: envs.SHORT_CODE,
  siteId: envs.SITE_ID,
};
