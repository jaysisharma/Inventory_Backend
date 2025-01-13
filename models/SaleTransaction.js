import mongoose from 'mongoose';

const saleTransactionSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'SecondHandProduct', required: true },
  productName: { type: String, required: true },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
});

const SaleTransaction = mongoose.model('SaleTransaction', saleTransactionSchema);

export default SaleTransaction;
