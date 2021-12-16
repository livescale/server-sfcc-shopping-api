/*
Products Output Converter
*/
exports.catalogsConverter = (catalogs) => {
  const convertedCatalogs = [];

  if (catalogs.count > 0) {
    catalogs.data.forEach((catalog) => {
      convertedCatalogs.push({
        id: catalog.id,
        name: catalog.name && catalog.name.default ? catalog.name.default : null,
        description: catalog.description && catalog.description.default ? catalog.description.default : null,
      });
    });
  }

  return convertedCatalogs;
};

exports.categoriesConverter = (categories) => {
  const convertedCategories = [];

  if (categories.count > 0) {
    categories.data.forEach((category) => {
      convertedCategories.push({
        id: category.id,
        name: category.name && category.name.default ? category.name.default : null,
        description: category.description && category.description.default ? category.description.default : null,
      });
    });
  }

  return convertedCategories;
};

const jsome = require('jsome');

exports.productsConverter = (products) => {
  const convertedProducts = [];

  const productsFound = products.hits;

  productsFound.forEach((productFound) => {
    const { product } = productFound;

    const typeKeys = Object.keys(product.type);

    let convertedProduct = {};
    if (typeKeys.includes('item')) {
      convertedProduct = productTypeItem(product);
    } else if (typeKeys.includes('variant')) {
      convertedProduct = productTypeVariant(product);
    } else if (typeKeys.includes('master')) {
      convertedProduct = productTypeMaster(product);
    }

    convertedProducts.push(convertedProduct);
  });

  return convertedProducts;
};

const productTypeItem = (product) => {
  const productImages = (product.imageGroups || []).find(
    (group) => group.variationAttributes === undefined && group.viewType === 'large'
  );

  const images = [];
  if (productImages) {
    (productImages.images || []).forEach((productImage) => {
      images.push(productImage.disBaseUrl);
    });
  }

  const variant = {
    sku: product.id,
    image: (product.image || {}).disBaseUrl,
    images: [],
    price: {
      amount: product.price,
      compare_at_amount: undefined,
      currency: product.priceCurrency,
      unit: product.unit,
      unit_measure: product.unitMeasure,
      price_per_unit: product.pricePerUnit,
    },
    attribute_values: [],
  };

  return {
    id: product.id,
    name: (product.name || {}).default,
    brand: product.brand,
    description: ((product.longDescription || {}).default || {}).source,
    short_description: ((product.shortDescription || {}).default || {}).source,
    image: (product.image || {}).disBaseUrl,
    images,
    attributes: [],
    variants: [variant],
  };
};

const productTypeVariant = (product) => {
  const productImages = (product.imageGroups || []).find(
    (group) => group.variationAttributes === undefined && group.viewType === 'large'
  );

  const images = [];
  if (productImages) {
    (productImages.images || []).forEach((productImage) => {
      images.push(productImage.disBaseUrl);
    });
  }

  const variant = {
    sku: product.id,
    image: (product.image || {}).disBaseUrl,
    images: [],
    price: {
      amount: product.price,
      compare_at_amount: undefined,
      currency: product.priceCurrency,
      unit: product.unit,
      unit_measure: product.unitMeasure,
      price_per_unit: product.pricePerUnit,
    },

    attribute_values: [],
  };

  return {
    id: (product.master || {}).masterId,
    name: (product.name || {}).default,
    brand: product.brand,
    description: ((product.longDescription || {}).default || {}).source,
    short_description: ((product.shortDescription || {}).default || {}).source,
    image: (product.image || {}).disBaseUrl,
    images,
    attributes: [],
    variants: [variant],
  };
};

const productTypeMaster = (product) => {
  const productImages = (product.imageGroups || []).find(
    (group) => group.variationAttributes === undefined && group.viewType === 'large'
  );

  const images = [];
  if (productImages) {
    (productImages.images || []).forEach((productImage) => {
      images.push(productImage.disBaseUrl);
    });
  }

  const variants = [];
  const attributes = [];

  if (product.variationAttributes && product.variationAttributes.length > 0) {
    product.variationAttributes.forEach((variationAttribute) => {
      const values = [];

      variationAttribute.values.forEach((value) => {
        values.push({
          name: (value.name || {}).default,
          description: (value.description || {}).default,
          image_swatch: (value.imageSwatch || {}).disBaseUrl,
          value: value.value,
        });
      });

      attributes.push({
        id: variationAttribute.id,
        name: (variationAttribute.name || {}).default,
        input_type: 'DROPDOWN',
        values,
      });
    });
  }

  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((variant) => {
      const attribute_values = [];

      if (variant.variationValues) {
        const variationValues = Object.keys(variant.variationValues);

        variationValues.forEach((variationValue) => {
          attribute_values.push({
            key: variationValue,
            value: variant.variationValues[variationValue],
          });
        });
      }

      variants.push({
        sku: variant.productId,
        image: (variant.image || {}).disBaseUrl,
        images: [],
        price: {
          amount: product.price,
          compare_at_amount: undefined,
          currency: product.priceCurrency,
          unit: product.unit,
          unit_measure: product.unitMeasure,
          price_per_unit: product.pricePerUnit,
        },

        variations: attribute_values,
      });
    });
  }

  return {
    id: product.id,
    name: (product.name || {}).default,
    brand: product.brand,
    description: ((product.longDescription || {}).default || {}).source,
    short_description: ((product.shortDescription || {}).default || {}).source,
    image: (product.image || {}).disBaseUrl,
    images,
    attributes,
    variants,
  };
};

/*
Basket Output Converter
*/
exports.basketConverter = (basket) => {
  const discounts = [];
  let discounts_total = 0;

  if (basket.orderPriceAdjustments && basket.orderPriceAdjustments.length > 0) {
    basket.orderPriceAdjustments.forEach((priceAdjustment) => {
      const couponItem = basket.couponItems.find((couponItem) => couponItem.code === priceAdjustment.couponCode);

      if (priceAdjustment.appliedDiscount.percentage) {
        discounts.push({
          id: couponItem.couponItemId,
          name: priceAdjustment.itemText,
          code: priceAdjustment.couponCode,
          applied_on: 'order',
          product_applied_on: null,
          value_type: 'PERCENTAGE',
          value: priceAdjustment.appliedDiscount.percentage,
          discount_amount: priceAdjustment.price,
          discount_currency: basket.currency,
        });

        discounts_total += Math.abs(priceAdjustment.price);
      } else {
        discounts.push({
          id: couponItem.couponItemId,
          name: priceAdjustment.itemText,
          code: priceAdjustment.couponCode,
          applied_on: 'order',
          product_applied_on: null,
          value_type: 'AMOUNT',
          value: priceAdjustment.appliedDiscount.amount,
          discount_amount: priceAdjustment.price,
          discount_currency: basket.currency,
        });

        discounts_total += Math.abs(priceAdjustment.price);
      }
    });
  }

  basket.shippingItems.forEach((shippingItem) => {
    if (shippingItem.priceAdjustments && shippingItem.priceAdjustments.length > 0) {
      shippingItem.priceAdjustments.forEach((priceAdjustment) => {
        if (priceAdjustment.appliedDiscount.percentage) {
          discounts.push({
            id: priceAdjustment.promotionId,
            name: priceAdjustment.itemText,
            code: priceAdjustment.couponCode,
            applied_on: 'shipping',
            product_applied_on: null,
            value_type: 'PERCENTAGE',
            value: priceAdjustment.appliedDiscount.percentage,
            discount_amount: priceAdjustment.price,
            discount_currency: basket.currency,
          });

          discounts_total += Math.abs(priceAdjustment.price);
        } else if (Math.abs(priceAdjustment.price) === shippingItem.price) {
          discounts.push({
            id: priceAdjustment.promotionId,
            name: priceAdjustment.itemText,
            code: priceAdjustment.couponCode,
            applied_on: 'shipping',
            product_applied_on: null,
            value_type: 'FREE',
            value: priceAdjustment.appliedDiscount.amount || 1,
            discount_amount: priceAdjustment.price,
            discount_currency: basket.currency,
          });

          discounts_total += Math.abs(priceAdjustment.price);
        } else {
          discounts.push({
            id: priceAdjustment.promotionId,
            name: priceAdjustment.itemText,
            code: priceAdjustment.couponCode,
            applied_on: 'shipping',
            product_applied_on: null,
            value_type: 'AMOUNT',
            value: priceAdjustment.appliedDiscount.amount || 1,
            discount_amount: priceAdjustment.price,
            discount_currency: basket.currency,
          });

          discounts_total += Math.abs(priceAdjustment.price);
        }
      });
    }
  });

  const items = [];
  if (basket.productItems && basket.productItems.length > 0) {
    basket.productItems.forEach((productItem) => {
      if (productItem.priceAdjustments && productItem.priceAdjustments.length > 0) {
        productItem.priceAdjustments.forEach((priceAdjustment) => {
          const couponItem = basket.couponItems.find((couponItem) => couponItem.code === priceAdjustment.couponCode);

          if (priceAdjustment.appliedDiscount.percentage) {
            items.push({
              quantity: productItem.quantity,
              price: {
                amount: productItem.price,
                currency: basket.currency,
              },
              discounted_price: {
                amount:
                  productItem.price === productItem.priceAfterOrderDiscount
                    ? null
                    : productItem.priceAfterOrderDiscount,
                currency: basket.currency,
              },
              id: productItem.itemId,
              sku: productItem.productId,
            });

            discounts.push({
              id: couponItem.couponItemId,
              name: priceAdjustment.itemText,
              code: priceAdjustment.couponCode,
              applied_on: productItem.productId,
              value_type: 'PERCENTAGE',
              value: priceAdjustment.appliedDiscount.percentage,
              discount_amount: priceAdjustment.price,
              discount_currency: basket.currency,
            });

            discounts_total += Math.abs(priceAdjustment.price);
          } else if (priceAdjustment.appliedDiscount.amount === undefined) {
            items.push({
              quantity: productItem.quantity,
              price: {
                amount: productItem.price,
                currency: basket.currency,
              },
              discounted_price: {
                amount:
                  productItem.price === productItem.priceAfterOrderDiscount
                    ? null
                    : productItem.priceAfterOrderDiscount,
                currency: basket.currency,
              },
              id: productItem.itemId,
              sku: productItem.productId,
            });

            discounts.push({
              id: couponItem.couponItemId,
              name: priceAdjustment.itemText,
              code: priceAdjustment.couponCode,
              applied_on: productItem.productId,
              value_type: 'FREE',
              value: priceAdjustment.appliedDiscount.amount || 1,
              discount_amount: priceAdjustment.price,
              discount_currency: basket.currency,
            });

            discounts_total += Math.abs(priceAdjustment.price);
          } else {
            items.push({
              quantity: productItem.quantity,
              price: {
                amount: productItem.price,
                currency: basket.currency,
              },
              discounted_price: {
                amount:
                  productItem.price === productItem.priceAfterOrderDiscount
                    ? null
                    : productItem.priceAfterOrderDiscount,
                currency: basket.currency,
              },
              id: productItem.itemId,
              sku: productItem.productId,
            });

            discounts.push({
              id: couponItem.couponItemId,
              name: priceAdjustment.itemText,
              code: priceAdjustment.couponCode,
              applied_on: productItem.productId,
              value_type: 'AMOUNT',
              value: priceAdjustment.appliedDiscount.amount || 1,
              discount_amount: priceAdjustment.price,
              discount_currency: basket.currency,
            });

            discounts_total += Math.abs(priceAdjustment.price);
          }
        });
      } else {
        items.push({
          quantity: productItem.quantity,
          price: {
            amount: productItem.price,
            currency: basket.currency,
          },
          discounted_price: {
            amount:
              productItem.price === productItem.priceAfterOrderDiscount ? null : productItem.priceAfterOrderDiscount,
            currency: basket.currency,
          },
          id: productItem.itemId,
          sku: productItem.productId,
        });
      }
    });
  }

  let shipping_address = null;
  let shipping_method = null;
  if (basket.shipments[0]) {
    const shipment = basket.shipments[0];
    if (shipment.shippingAddress) {
      shipping_address = {
        first_name: shipment.shippingAddress.firstName,
        last_name: shipment.shippingAddress.lastName,
        address1: shipment.shippingAddress.address1,
        address2: shipment.shippingAddress.address2,
        city: shipment.shippingAddress.city,
        country_code_alpha_2: shipment.shippingAddress.countryCode,
        province_code: shipment.shippingAddress.stateCode,
        zip: shipment.shippingAddress.postalCode,
        phone: shipment.shippingAddress.phone,
      };
    }
    if (shipment.shippingMethod) {
      shipping_method = {
        id: shipment.shippingMethod.id,
        name: shipment.shippingMethod.name,
        carrier: null,
        price: {
          amount: shipment.shippingMethod.price,
          currency: basket.currency,
        },
      };
    }
  }

  let billing_address = null;
  if (basket.billingAddress) {
    billing_address = {
      first_name: basket.billingAddress.firstName,
      last_name: basket.billingAddress.lastName,
      address1: basket.billingAddress.address1,
      address2: basket.billingAddress.address2,
      city: basket.billingAddress.city,
      country_code_alpha_2: basket.billingAddress.countryCode,
      province_code: basket.billingAddress.stateCode,
      zip: basket.billingAddress.postalCode,
      phone: basket.billingAddress.phone,
    };
  }

  let payment_method = null;
  if (basket.paymentInstruments) {
    const paymentInstrument = basket.paymentInstruments[0];
    payment_method = {
      id: paymentInstrument.paymentMethodId,
      name: paymentInstrument.paymentMethodId,
    };
  }

  const convertedBasket = {
    id: basket.basketId,
    currency: basket.currency,
    cart_url: null,
    customer: {
      id: basket.customerInfo.customerId,
      email: basket.customerInfo.email,
    },
    items,
    discounts,
    shipping_address,
    shipping_method,
    billing_address,
    payment_method,
    sub_total: basket.productSubTotal,
    discounts_total,
    shipping_total: basket.shippingTotal,
    taxes_total: basket.taxTotal,
    total: basket.orderTotal,
    taxation: basket.taxation.toUpperCase(),
  };

  return convertedBasket;
};

exports.shippingMethodsConverter = (shippingMethods) => {
  const convertedShippingMethods = [];
  const { applicableShippingMethods } = shippingMethods;

  applicableShippingMethods.forEach((applicableShippingMethod) => {
    convertedShippingMethods.push({
      id: applicableShippingMethod.id,
      name: applicableShippingMethod.name,
      carrier: null,
      price: {
        amount: applicableShippingMethod.price,
        currency: 'USD', // @todo hardcoded for now, it is a required field by the OpenAPI spec
      },
    });
  });

  return convertedShippingMethods;
};

exports.paymentMethodsConverter = (paymentMethods) => {
  const convertedPaymentMethods = [];
  const { applicablePaymentMethods } = paymentMethods;
  applicablePaymentMethods.forEach((applicablePaymentMethod) => {
    convertedPaymentMethods.push({
      id: applicablePaymentMethod.id,
      name: applicablePaymentMethod.name,
    });
  });

  return convertedPaymentMethods;
};

exports.orderConverter = (order) => {
  const convertedOrder = {
    id: order.orderNo,
    status: order.status,
    payment_status: order.paymentStatus,
    total_invoiced: order.orderTotal,
    total_paid: 0.0,
  };

  return convertedOrder;
};
