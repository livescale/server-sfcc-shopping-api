const { Checkout } = require('commerce-sdk');

const { getStorefrontConfig } = require('../config/commerce-sdk');

const {
  billingAddressConverter,
  paymentMethodConverter,
} = require('../converters/inputConverters');
const {
  basketConverter,
  paymentMethodsConverter,
} = require('../converters/outputConverters');

module.exports = function (app) {
  app.put('/baskets/:basket_id/billing_address', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedBillingAddress = billingAddressConverter(req.body);

      const basket = await shopperBasketsClient.updateBillingAddressForBasket({
        parameters: { basketId },
        body: convertedBillingAddress,
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

  app.get('/baskets/:basket_id/payment_methods', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const paymentMethods =
        await shopperBasketsClient.getPaymentMethodsForBasket({
          parameters: { basketId },
        });

      const convertedPaymentMethods = paymentMethodsConverter(paymentMethods);

      res.status(200).send(convertedPaymentMethods);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.put('/baskets/:basket_id/payment_method', async (req, res, next) => {
    const { basket_id: basketId } = req.params;
    const { id: paymentMethodId } = req.body;

    const config = getStorefrontConfig(req.session.shopper_token);

    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const basket = await shopperBasketsClient.getBasket({
        parameters: { basketId },
      });

      const convertedPaymentMethod = paymentMethodConverter(
        paymentMethodId,
        basket.orderTotal
      );

      const updatedBasket =
        await shopperBasketsClient.addPaymentInstrumentToBasket({
          parameters: { basketId },
          body: convertedPaymentMethod,
        });

      const convertedBasket = basketConverter(updatedBasket);

      res.status(200).send(convertedBasket);
      return next();
    } catch (error) {
      if (error.isAxiosError) {
        res.status(error.response.status).send({
          status: error.response.status,
          message: error.response.data.error_description,
        });

        return next();
      }

      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });
};
