const { Checkout } = require('commerce-sdk');
const { getStorefrontConfig } = require('../config/commerce-sdk');

const { shippingAddressConverter } = require('../converters/inputConverters');
const {
  basketConverter,
  shippingMethodsConverter,
} = require('../converters/outputConverters');

module.exports = function (app) {
  app.put('/baskets/:basket_id/shipping_address', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedShippingAddress = shippingAddressConverter(req.body);

      // shipmentId is hardcoded to 'me'. This is the default shipment for SFCC basket.
      const basket =
        await shopperBasketsClient.updateShippingAddressForShipment({
          parameters: { basketId, shipmentId: 'me' },
          body: convertedShippingAddress,
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

  app.get('/baskets/:basket_id/shipping_methods', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      // shipmentId is hardcoded to 'me'. This is the default shipment for SFCC basket.
      const shippingMethods =
        await shopperBasketsClient.getShippingMethodsForShipment({
          parameters: { basketId, shipmentId: 'me' },
        });

      const convertedShippingMethods =
        shippingMethodsConverter(shippingMethods);

      res.status(200).send(convertedShippingMethods);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.put('/baskets/:basket_id/shipping_method', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      // shipmentId is hardcoded to 'me'. This is the default shipment for SFCC basket.
      const basket = await shopperBasketsClient.updateShippingMethodForShipment(
        {
          parameters: { basketId, shipmentId: 'me' },
          body: req.body,
        }
      );

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
