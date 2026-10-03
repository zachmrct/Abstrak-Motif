const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  name: { type: String, required: true },
  picture: { type: String, required: true },
  price: { type: Number, required: true },
  SKU: { type: String, required: true },
  material: { type: [String], required: true },
  variations: { type: [Map], required: true },
  lastInventoryUpdate: { type: Date, required: true}
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
