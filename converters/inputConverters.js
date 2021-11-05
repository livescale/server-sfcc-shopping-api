/*
Basket Input Converter
*/

exports.itemsConverter = function (items) {
  const convertedItems = [];
  items.forEach((item) => {
    convertedItems.push({
      productId: item.id,
      quantity: item.quantity,
    });
  });

  return convertedItems;
};

exports.itemConverter = function (item) {
  const convertedItem = {
    productId: item.id,
    quantity: item.quantity,
  };

  return convertedItem;
};

exports.basketCustomerConverter = function (customer) {
  const convertedCustomer = {
    customerNo: customer.id,
    email: customer.email,
  };

  return convertedCustomer;
};

exports.shippingAddressConverter = function (shippingAddress) {
  const convertedShippingAddress = {
    firstName: shippingAddress.first_name,
    lastName: shippingAddress.last_name,
    countryCode: shippingAddress.country_code_alpha_2,
    stateCode: shippingAddress.province_code,
    city: shippingAddress.city,
    address1: shippingAddress.address1,
    address2: shippingAddress.address2,
    postalCode: shippingAddress.zip,
    phone: shippingAddress.phone,
  };

  return convertedShippingAddress;
};

exports.couponPromotionConverter = function (promotion) {
  const convertedCouponPromotion = {
    code: promotion.coupon,
  };

  return convertedCouponPromotion;
};

exports.billingAddressConverter = function (billingAddress) {
  const convertedBillingAddress = {
    firstName: billingAddress.first_name,
    lastName: billingAddress.last_name,
    countryCode: billingAddress.country_code_alpha_2,
    stateCode: billingAddress.province_code,
    city: billingAddress.city,
    address1: billingAddress.address1,
    address2: billingAddress.address2,
    postalCode: billingAddress.zip,
    phone: billingAddress.phone,
  };

  return convertedBillingAddress;
};

exports.paymentMethodConverter = (paymentMethodId, amount) => {
  const convertedPaymentMethod = {
    amount,
    paymentMethodId,
  };

  return convertedPaymentMethod;
};
