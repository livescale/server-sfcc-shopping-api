const { Product } = require('commerce-sdk');
const {
  catalogsConverter,
  categoriesConverter,
  productsConverter,
} = require('../converters/outputConverters');

module.exports = (app, config) => {
  app.get('/catalogs', async (req, res, next) => {
    config.headers.authorization = req.headers.authorization;

    const catalogsClient = new Product.Catalogs(config);

    try {
      const catalogs = await catalogsClient.getCatalogs();

      const convertedCatalogs = catalogsConverter(catalogs);

      res.status(200).send(convertedCatalogs);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.get('/catalogs/:catalog_id/categories', async (req, res, next) => {
    config.headers.authorization = req.headers.authorization;
    const { offset, limit } = req.query;
    const { catalog_id } = req.params;

    const catalogsClient = new Product.Catalogs(config);

    try {
      const categories = await catalogsClient.getCategoriesFromCatalog({
        parameters: { catalogId: catalog_id, limit, offset },
      });

      const convertedCategories = categoriesConverter(categories);

      res.status(200).send(convertedCategories);
      return next();
    } catch (error) {
      const readableError = await error.response.json();

      res
        .status(error.response.status)
        .send({ status: error.response.status, message: readableError.detail });

      return next();
    }
  });

  app.get(
    '/catalogs/:catalog_id/categories/:category_id/products',
    async (req, res, next) => {
      config.headers.authorization = req.headers.authorization;
      const { offset, limit } = req.query;
      const { catalog_id, category_id } = req.params;

      const catalogsClient = new Product.Catalogs(config);

      try {
        const products = await catalogsClient.getAssignedProductFromCategory({
          parameters: {
            catalogId: catalog_id,
            categoryId: category_id,
          },
          body: {
            limit: Number(limit),
            offset: Number(offset),
            query: {
              textQuery: {
                fields: ['onlineFlag'],
                searchPhrase: 'true',
              },
            },
          },
        });

        const convertedProducts = productsConverter(products);

        res.status(200).send(convertedProducts);
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
