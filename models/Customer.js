import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact_no: { type: String, required: true },
  email: { type: String, required: false },
  address: { type: String, required: false }
});

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
