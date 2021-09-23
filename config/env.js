const dotenv = require('dotenv');
const result = dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

if (result.error) {
  throw result.error;
}

const { parsed: envs } = result;

module.exports = {
  port: envs.PORT,
  db_url: envs.DB_URL,
  clientId: envs.CLIENT_ID,
  organizationId: envs.ORGANIZATION_ID,
  shortCode: envs.SHORT_CODE,
  siteId: envs.SITE_ID,
};
