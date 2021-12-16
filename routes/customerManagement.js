const { Checkout } = require('commerce-sdk');
const { getStorefrontConfig } = require('../config/commerce-sdk');

const { basketCustomerConverter } = require('../converters/inputConverters');
const { basketConverter } = require('../converters/outputConverters');

module.exports = function (app) {
  app.put('/baskets/:basket_id/customer', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedCustomer = basketCustomerConverter(req.body);

      const basket = await shopperBasketsClient.updateCustomerForBasket({
        parameters: { basketId },
        body: convertedCustomer,
      });

      const convertedBasket = basketConverter(basket);

      res.status(200).send(convertedBasket);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res.status(error.response.status).send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });
};
