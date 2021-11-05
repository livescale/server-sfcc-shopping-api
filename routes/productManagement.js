const { Product } = require('commerce-sdk');
const {
  catalogsConverter,
  categoriesConverter,
  productsConverter,
} = require('../converters/outputConverters');

const { getAdminConfig } = require('../config/commerce-sdk');

module.exports = (app) => {
  app.get('/catalogs', async (req, res, next) => {
    const { offset, limit } = req.query;

    try {
      const config = await getAdminConfig();

      const catalogsClient = new Product.Catalogs(config);

      let convertedCatalogs = [];
      let catalogs = await catalogsClient.getCatalogs({
        parameters: { limit, offset },
      });

      convertedCatalogs = convertedCatalogs.concat(catalogsConverter(catalogs));

      while (catalogs.start + catalogs.count < catalogs.total) {
        const newOffset = catalogs.start + catalogs.count;
        catalogs = await catalogsClient.getCatalogs({
          parameters: { limit, offset: newOffset },
        });

        convertedCatalogs = convertedCatalogs.concat(
          catalogsConverter(catalogs)
        );
      }

      res.status(200).send(convertedCatalogs);
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

  app.get('/catalogs/:catalog_id/categories', async (req, res, next) => {
    const { offset, limit } = req.query;
    const { catalog_id } = req.params;

    try {
      const config = await getAdminConfig();
      const catalogsClient = new Product.Catalogs(config);

      const categories = await catalogsClient.getCategoriesFromCatalog({
        parameters: { catalogId: catalog_id, limit, offset },
      });

      const convertedCategories = categoriesConverter(categories);

      res.status(200).send(convertedCategories);
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

  app.get(
    '/catalogs/:catalog_id/categories/:category_id/products',
    async (req, res, next) => {
      const { offset, limit } = req.query;
      const { catalog_id, category_id } = req.params;

      try {
        const config = await getAdminConfig();
        const catalogsClient = new Product.Catalogs(config);

        const products = await catalogsClient.searchProductsAssignedToCategory({
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
        if (error.isAxiosError) {
          res.status(error.response.status).send({
            status: error.response.status,
            message: error.response.data.error_description,
          });

          return next();
        }

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
