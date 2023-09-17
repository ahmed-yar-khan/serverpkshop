// const mongoose = require('mongoose');

// const priceSchema = new mongoose.Schema({
//   weightOptions: String,
//   prices: String,
// });

// const productSchema = new mongoose.Schema({
//   category: String,
//   title: String,
//   rating: String,
//   availability: String,
//   additionalImages: [
//     {
//       url: String,   
//       originalName: String, 
//     }
//   ],
//   weightOptions: [String],
//   description: String,
//   price: [priceSchema],
// });

// const Product = mongoose.model('Product', productSchema);

// module.exports = Product;










const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: String,
  title: String,
  rating: String,
  availability: String,
  additionalImages: [
    {
      url: String,   
      originalName: String, 
    }
  ],
  weightOptions: [String],
  description: String,
  prices: String,

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
