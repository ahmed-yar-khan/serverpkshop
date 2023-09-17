const mongoose = require('mongoose');


const OrderSchema = new mongoose.Schema({
  firstname: String,
  email: String,
  number: String,
  address: String,
  city: String,
  checkoutData: Object, // Adjust this based on your data structure
  date: Date,
});

const OrderModel = mongoose.model('Order', OrderSchema);

module.exports = OrderModel;