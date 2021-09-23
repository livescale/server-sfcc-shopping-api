const { Request, Response } = require('oauth2-server');

module.exports = (app) => {
  app.post('/oauth/token', (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    const accessTokenLifetime = 3600;

    return app.oauth
      .token(request, response, { accessTokenLifetime })
      .then((code) => {
        res.status(200).send({
          access_token: code.accessToken,
          token_type: 'bearer',
          expires_in: accessTokenLifetime,
        });

        return next();
      })
      .catch(async (error) => {
        res
          .status(error.status)
          .send({ status: error.status, message: error.message });

        return next();
      });
  });
};
