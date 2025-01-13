import express from "express";
import RepairService from "../models/Repair.js";
import Sales from "../models/Sales.js";
import SaleTransaction from "../models/SaleTransaction.js"; // Assuming you have this model
import router from "./productRoutes.js";

const repairRouter = express.Router();

// Get all repair services
repairRouter.get("/", async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res.status(404).json({ message: "No repair services found." });
    }
    res.status(200).json({
      message: "Repair services retrieved successfully.",
      data: repairServices,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving repair services",
      error: error.message,
    });
  }
});



repairRouter.get("/total-revenue", async (req, res) => {
  try {
    // Calculate total revenue from Sales
    const sales = await Sales.find();
    let totalRevenueFromSales = 0;
    sales.forEach((sale) => {
      totalRevenueFromSales += sale.totalAmount;
    });

    // Calculate total revenue from Second-Hand Product Sales
    const saleTransactions = await SaleTransaction.find();
    let totalRevenueFromSecondHandProducts = 0;
    saleTransactions.forEach((transaction) => {
      totalRevenueFromSecondHandProducts += transaction.totalAmount;
    });

    // Calculate total revenue from Repair Services
    const repairServices = await RepairService.find();
    let totalRevenueFromRepairServices = 0;
    repairServices.forEach((service) => {
      totalRevenueFromRepairServices += service.repairCost;
    });

    // Sum up all the revenues
    const totalRevenue =
      totalRevenueFromSales + totalRevenueFromSecondHandProducts + totalRevenueFromRepairServices;

    res.status(200).json({
      totalRevenue,
      totalRevenueFromSales,
      totalRevenueFromSecondHandProducts,
      totalRevenueFromRepairServices,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optional: Generate a report of repair services (commented out)
repairRouter.get("/report", async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res.status(404).json({ message: "No repair service data available." });
    }

    let totalRepairCost = 0;
    let totalRepairs = repairServices.length;
    const statusSummary = {
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Canceled: 0,
    };
    const productSummary = {
      Camera: { repairsCount: 0, totalRepairCost: 0 },
      Drone: { repairsCount: 0, totalRepairCost: 0 },
      LED: { repairsCount: 0, totalRepairCost: 0 },
      Others: { repairsCount: 0, totalRepairCost: 0 },
    };

    repairServices.forEach((repair) => {
      totalRepairCost += repair.repairCost;
      statusSummary[repair.repairStatus]++;

      const productName = repair.productName;
      if (productSummary[productName]) {
        productSummary[productName].repairsCount++;
        productSummary[productName].totalRepairCost += repair.repairCost;
      }
    });

    const report = {
      totalRepairCost,
      totalRepairs,
      statusSummary,
      productSummary,
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get a single repair service by ID
repairRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const repairService = await RepairService.findById(id);
    if (!repairService) {
      return res.status(404).json({ message: "Repair service not found." });
    }
    res.status(200).json({
      message: "Repair service retrieved successfully.",
      data: repairService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving repair service",
      error: error.message,
    });
  }
});

// Create a new repair service
repairRouter.post("/", async (req, res) => {
  try {
    const repair = new RepairService(req.body);
    const savedRepair = await repair.save();
    res.status(201).json({
      message: "Repair service created successfully!",
      data: savedRepair,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating repair service",
      error: error.message,
    });
  }
});

repairRouter.patch("/:repairServiceId/products/:productIndex", async (req, res) => {
  const { repairServiceId, productIndex } = req.params;
  const { servicingCompleted, technicianName } = req.body; // Extract servicingCompleted and technicianName from the request body

  if (typeof servicingCompleted !== "boolean") {
    return res.status(400).json({ message: "servicingCompleted must be a boolean value." });
  }

  if (technicianName && typeof technicianName !== "string") {
    return res.status(400).json({ message: "technicianName must be a string." });
  }

  try {
    // Find the repair service by ID
    const repairService = await RepairService.findById(repairServiceId);
    if (!repairService) {
      return res.status(404).json({ message: "Repair service not found." });
    }

    // Check if the product exists in the products array by index
    const product = repairService.products[productIndex];
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Update the servicingCompleted field for the specific product
    product.servicingCompleted = servicingCompleted;

    // If a technicianName is provided, update it in the repair service schema
    if (technicianName) {
      repairService.technicianName = technicianName;  // Set technician name globally for the repair service
    }

    // Save the updated repair service document
    await repairService.save();

    return res.status(200).json({ message: "Product servicing status updated successfully.", repairService });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating product servicing status." });
  }
});


// Update a repair service by ID
repairRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedRepairService = await RepairService.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    if (!updatedRepairService) {
      return res.status(404).json({ message: "Repair service not found." });
    }
    res.status(200).json({
      message: "Repair service updated successfully.",
      data: updatedRepairService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating repair service",
      error: error.message,
    });
  }
});

// Update repair status by ID
repairRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { repairStatus, repairCost } = req.body;

  // Ensure repairStatus is provided
  if (!repairStatus) {
    return res.status(400).json({ message: "Repair status is required." });
  }

  // Validate repairCost if provided
  if (repairCost !== undefined && (isNaN(repairCost) || repairCost < 0)) {
    return res
      .status(400)
      .json({ message: "Repair cost must be a valid non-negative number." });
  }

  try {
    const updatedOrder = await RepairService.findByIdAndUpdate(
      id,
      {
        repairStatus,
        ...(repairCost !== undefined && { repairCost }), // Only update if repairCost is provided
      },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Repair order not found." });
    }

    res.status(200).json({
      message: "Repair order updated successfully.",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating repair order:", error);
    res.status(500).json({ message: "Server error." });
  }
});


// Delete a repair service by ID
repairRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRepairService = await RepairService.findByIdAndDelete(id);
    if (!deletedRepairService) {
      return res.status(404).json({ message: "Repair service not found." });
    }
    res.status(200).json({
      message: "Repair service deleted successfully.",
      data: deletedRepairService,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting repair service",
      error: error.message,
    });
  }
});

export default repairRouter;
