import mongoose from "mongoose";

const secondHandProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String },
  images: { type: [String] }, // Array of strings for multiple image URLs
  condition: {
    type: String,
    enum: ["Excellent", "Good", "Fair", "Poor"], // Represents the product condition
    required: true,
    default: "Excellent",
  },
  usageDuration: {
    type: String, // String format (e.g., "6 months", "1 year")
    default: "",
  },
  conditionNotes: {
    type: String, // Additional notes about the product condition
    default: "",
  },
  createdAt: { type: Date, default: Date.now },
});

const SecondHandProduct = mongoose.model(
  "SecondHandProduct",
  secondHandProductSchema
);

export default SecondHandProduct;
