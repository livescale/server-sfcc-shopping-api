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
