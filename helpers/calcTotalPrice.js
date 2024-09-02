const calcTotalPrice = (items) => {
  return items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
};

export default calcTotalPrice;
