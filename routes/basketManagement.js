const { Checkout } = require('commerce-sdk');
const { itemsConverter } = require('../converters/inputConverters');
const { basketConverter } = require('../converters/outputConverters');

module.exports = function (app, config) {
  app.post('/baskets', async (req, res, next) => {
    config.headers.authorization = req.session.shopper_token;

    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedItems = itemsConverter(req.body);

      const basket = await shopperBasketsClient.createBasket({
        body: { productItems: convertedItems },
      });

      const convertedBasket = basketConverter(basket);

      //here they gonna know. Documented here
      // const redirectionUrl = `https://my-shop.com/${basketId}`;
      // convertedBasket.cart_rul = redirectionUrl;

      res.status(200).send(convertedBasket);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.post('/baskets/:basket_id/items', async (req, res, next) => {
    const { basket_id: basketId } = req.params;
    config.headers.authorization = req.session.shopper_token;

    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedItems = itemsConverter(req.body);

      const basket = await shopperBasketsClient.addItemToBasket({
        parameters: { basketId },
        body: convertedItems,
      });

      const convertedBasket = basketConverter(basket);

      res.status(200).send(convertedBasket);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });
};
