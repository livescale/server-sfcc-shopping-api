module.exports = (app) => {
  app.post('/health', (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    res
      .status(200)
      .send('Health Check, Server Working!')
      .catch(async (error) => {
        res.status(error.status).send({ status: error.status, message: error.message });

        return next();
      });
  });
};
