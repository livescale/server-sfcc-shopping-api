const { helpers } = require('commerce-sdk');

module.exports = (app, config) => {
  app.post('/customers/login', (req, res, next) => {
    helpers
      .getShopperToken(config, { type: req.body.type })
      .then(async (token) => {
        try {
          const hour = 3600000;

          // This is going to save the shopper_token in a session and we be available on req.session.shopper_token in other endpoints.
          req.session.shopper_token = token.getBearerHeader();
          req.session.cookie.expires = new Date(Date.now() + hour);
          req.session.cookie.maxAge = hour;
          req.session.save();

          res.status(200).send();
          return next();
        } catch (error) {
          const readableError = await error.response.json();

          res.status(error.response.status).send({
            status: error.response.status,
            message: readableError.detail,
          });

          return next();
        }
      })
      .catch(async (error) => {
        const readableError = await error.response.json();

        res.status(error.response.status).send({
          status: error.response.status,
          message: readableError.detail,
        });

        return next();
      });
  });
};
