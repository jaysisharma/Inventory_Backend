import mongoose from "mongoose";

// Define Schema for each product accessory in the order
const productSchema = new mongoose.Schema({
  modelNo: {
    type: String,
    trim: true,
  },
  serialNo: {
    type: String,
    trim: true, // Serial number is optional but should be trimmed
  },
  problem: {
    type: String,
    trim: true,
  },
  productType: {
    type: String,
    enum: ["camera", "drone", "led", "other"], // List of allowed product types
  },
  servicingCompleted: {
    type: Boolean,
    default: false, // Default to false
  },
  selectedAccessories: {
    type: [String],
    default: [], // Default to empty array
  },
  accessoryDescriptions: {
    type: Map,
    of: String,
    default: {}, // Map of accessory descriptions
  },
  image: {
    type: String, // URL or path to the image
    trim: true,
    validate: {
      validator: function (v) {
        // Basic URL validation
        return !v || /^https?:\/\/[^ ]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
});

// Define Schema for Repair Service
const repairServiceSchema = new mongoose.Schema({
  productName: {
    type: String,
    enum: ["Camera", "Drone", "LED", "Camera & Drone", "Others"], // Only these options are allowed
    trim: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: String,
  },
  customerEmail: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Simple email validation regex
        return !v || /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: "Invalid email address.",
    },
  },
  repairCost: {
    type: Number,
    min: 0, // Ensure repair cost is non-negative
    validate: {
      validator: function (v) {
        return !v || !isNaN(v); // Make sure the value is a number
      },
      message: "Repair cost must be a valid number.",
    },
    default: 0
  },
  products: {
    type: [productSchema],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length > 0;
      },
      message: "At least one product must be included.",
    },
  },
  repairStatus: {
    type: String,
    enum: ["Pending", "In Progress", "Completed", "Canceled"],
    default: "Pending",
  },
  expectationAmount: {
    type: String,
    trim: true,
  },
  totalItems: {
    type: Number,
    min: 1, // Minimum of one item
  },
  expectedDeliveryDate: {
    type: Date,
  },
  receiverName: {
    type: String,
    trim: true,
  },
  technicianName: {
    type: String,
    trim: true, // Optional but should be trimmed
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  completionDate: {
    type: Date,
    validate: {
      validator: function (v) {
        // Ensure completionDate is not before the startDate
        return !v || v >= this.startDate;
      },
      message: "Completion date must be on or after the start date.",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Ensure creation date cannot be changed
  },
});

const RepairService = mongoose.model("RepairService", repairServiceSchema);

export default RepairService;
