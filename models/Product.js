import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: {
    type: [String], // Array of strings for multiple image URLs
    required: false,
  },
  brand:{
    type: String,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
