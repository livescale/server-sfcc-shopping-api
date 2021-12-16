const { Checkout } = require('commerce-sdk');
const { getStorefrontConfig } = require('../config/commerce-sdk');
const { itemsConverter, itemConverter } = require('../converters/inputConverters');
const { basketConverter } = require('../converters/outputConverters');

module.exports = function (app) {
  app.post('/baskets', async (req, res, next) => {
    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    try {
      const convertedItems = itemsConverter(req.body);

      const basket = await shopperBasketsClient.createBasket({
        body: { productItems: convertedItems },
      });

      const convertedBasket = basketConverter(basket);

      /* To be able to make customer redirection to your e-commerce site checkout at the Basket Level you'll need to add to Cart Redirection URL here to the convertedBasket. Here is an example of what it could look like: 
      
      const cartRedirectionUrl = `https://my-shop.com/${basket.basketId}`;
      convertedBasket.cart_url = cartRedirectionUrl;
      */

      res.status(200).send(convertedBasket);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res.status(error.response.status).send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.post('/baskets/:basket_id/items', async (req, res, next) => {
    const { basket_id: basketId } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
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

      res.status(error.response.status).send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.put('/baskets/:basket_id/items/:item_id', async (req, res, next) => {
    const { basket_id: basketId, item_id } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    const currentBasket = await shopperBasketsClient.getBasket({
      parameters: {
        basketId,
      },
    });

    try {
      const convertedItems = itemConverter(req.body);

      const itemId =
        currentBasket.productItems.find((i) => i.productId === convertedItems.productId)?.itemId ?? item_id;

      const basket = await shopperBasketsClient.updateItemInBasket({
        parameters: { basketId, itemId },
        body: convertedItems,
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

  app.delete('/baskets/:basket_id/items/:item_id', async (req, res, next) => {
    const { basket_id: basketId, item_id } = req.params;

    const config = getStorefrontConfig(req.session.shopper_token);
    const shopperBasketsClient = new Checkout.ShopperBaskets(config);

    const currentBasket = await shopperBasketsClient.getBasket({
      parameters: {
        basketId,
      },
    });
    try {
      const itemId = currentBasket.productItems.find((i) => i.productId === item_id)?.itemId ?? item_id;

      const basket = await shopperBasketsClient.removeItemFromBasket({
        parameters: { basketId, itemId },
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
