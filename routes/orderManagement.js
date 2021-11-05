const { Checkout } = require('commerce-sdk');
const {
  getStorefrontConfig,
  getAdminConfig,
} = require('../config/commerce-sdk');

const { orderConverter } = require('../converters/outputConverters');

const jsome = require('jsome');

module.exports = function (app) {
  app.post('/orders', async (req, res, next) => {
    const { basket_id: basketId, payment_method_token: paymentMethodToken } =
      req.body;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperOrdersClient = new Checkout.ShopperOrders(config);

    try {
      const order = await shopperOrdersClient.createOrder({
        body: { basketId },
      });

      const convertedOrder = orderConverter(order);

      res.status(200).send(convertedOrder);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.put('/orders/:order_id', async (req, res, next) => {
    const { order_id: orderId } = req.params;
    const { psp_name: pspName, psp_transaction_id: pspTransactionId } =
      req.body;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperOrdersClient = new Checkout.ShopperOrders(config);

    const adminConfig = await getAdminConfig();
    const ordersClient = new Checkout.Orders(adminConfig);

    try {
      const order = await shopperOrdersClient.getOrder({
        parameters: { orderNo: orderId },
      });

      const paymentInstrument = order.paymentInstruments[0];

      await shopperOrdersClient.updatePaymentInstrumentForOrder({
        parameters: {
          orderNo: orderId,
          paymentInstrumentId: paymentInstrument.paymentInstrumentId,
        },
        body: {
          amount: paymentInstrument.amount,
          paymentMethodId: paymentInstrument.paymentMethodId,
          paymentCard: {
            cardType: paymentInstrument.paymentCard.cardType,
            maskedNumber: paymentInstrument.paymentCard.maskedNumber,
            expirationMonth: paymentInstrument.paymentCard.expirationMonth,
            expirationYear: paymentInstrument.paymentCard.expirationYear,
            holder: paymentInstrument.paymentCard.holder,
          },
          c_gatewayName: pspName,
          c_gatewayTransactionID: pspTransactionId,
        },
      });

      await ordersClient.updateOrder({
        parameters: { orderNo: orderId },
        body: {
          c_Adyen_pspReference: pspTransactionId,
        },
      });

      await ordersClient.updateOrderStatus({
        parameters: { orderNo: orderId },
        body: { status: 'new' },
      });

      const convertedOrder = orderConverter(order);

      res.status(200).send(convertedOrder);
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
