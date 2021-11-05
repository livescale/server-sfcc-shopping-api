const { Checkout } = require('commerce-sdk');
const { getStorefrontConfig } = require('../config/commerce-sdk');

const { couponPromotionConverter } = require('../converters/inputConverters');
const { basketConverter } = require('../converters/outputConverters');

module.exports = function (app) {
  app.put('/baskets/:basket_id/promotion', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedCouponPromotion = couponPromotionConverter(req.body);

      const basket = await shopperBasketsClient.addCouponToBasket({
        parameters: { basketId },
        body: convertedCouponPromotion,
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

  app.delete(
    '/baskets/:basket_id/promotion/:promotion_id',
    async (req, res, next) => {
      const { basket_id: basketId, promotion_id: promotionId } = req.params;

      const config = getStorefrontConfig(req.session.shopper_token);
      const shopperBasketsClient = new Checkout.ShopperBaskets(config);

      try {
        const basket = await shopperBasketsClient.removeCouponFromBasket({
          parameters: { basketId, couponItemId: promotionId },
        });

        const convertedBasket = basketConverter(basket);

        res.status(200).send(convertedBasket);
        return next();
      } catch (error) {
        const readableError = await error.response.json();

        res.status(error.response.status).send({
          status: error.response.status,
          message: readableError.detail,
        });

        return next();
      }
    }
  );
};
