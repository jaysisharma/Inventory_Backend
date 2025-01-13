import express from "express";
import RepairService from "../models/Repair.js";
import SaleTransaction from "../models/SaleTransaction.js";
import SecondHandProduct from "../models/SecondHandProduct.js";

const router = express.Router();

router.get("/report", async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res
        .status(404)
        .json({ message: "No repair service data available." });
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

// Second-Hand Product Routes
router.post("/", async (req, res) => {
  try {
    const newSecondHandProduct = new SecondHandProduct(req.body);

    await newSecondHandProduct.save();
    res.status(201).json({
      message: "Second-hand product created successfully!",
      data: newSecondHandProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating second-hand product",
      error: error.message,
    });
  }
});

// POST: Sell a Second-Hand Product (with SaleTransaction logging)
router.post("/sell", async (req, res) => {
  const { productId, quantitySold } = req.body;

  try {
    const secondHandProduct = await SecondHandProduct.findById(productId);

    if (!secondHandProduct) {
      return res
        .status(404)
        .json({ message: "Second-hand product not found." });
    }

    if (secondHandProduct.stock < quantitySold) {
      return res
        .status(400)
        .json({ message: "Not enough stock available to sell." });
    }

    secondHandProduct.stock -= quantitySold;
    await secondHandProduct.save();

    // Record the sale transaction in SaleTransaction model
    const saleTransaction = new SaleTransaction({
      productId: secondHandProduct._id,
      productName: secondHandProduct.name,
      quantitySold,
      salePrice: secondHandProduct.price,
      totalAmount: secondHandProduct.price * quantitySold,
    });

    await saleTransaction.save();

    res.status(200).json({
      message: "Second-hand product sold successfully!",
      saleTransaction,
      remainingStock: secondHandProduct.stock,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing the sale", error: error.message });
  }
});

// GET: Retrieve all Second-Hand Products

router.get("/", async (req, res) => {
  const { page = 1, limit = 10, category, search = "" } = req.query;

  try {
    const query = {
      ...(category ? { category } : {}),
      ...(search ? { name: { $regex: search, $options: "i" } } : {}), // Case-insensitive search
    };
    const skip = (page - 1) * limit;

    const secondHandProducts = await SecondHandProduct.find(query)
      .skip(skip)
      .limit(Number(limit));

    const totalProducts = await SecondHandProduct.countDocuments(query);

    if (!secondHandProducts.length) {
      return res
        .status(404)
        .json({ message: "No second-hand products found." });
    }

    res.status(200).json({
      message: "Second-hand products retrieved successfully.",
      data: secondHandProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving second-hand products",
      error: error.message,
    });
  }
});

// GET: Retrieve a Second-Hand Product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const secondHandProduct = await SecondHandProduct.findById(id);

    if (!secondHandProduct) {
      return res
        .status(404)
        .json({ message: "Second-hand product not found." });
    }

    res.status(200).json({
      message: "Second-hand product retrieved successfully.",
      data: secondHandProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving second-hand product",
      error: error.message,
    });
  }
});


// PUT: Update a Second-Hand Product by ID
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await SecondHandProduct.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Second-hand product not found." });
    }

    res.status(200).json({
      message: "Second-hand product updated successfully!",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating second-hand product",
      error: error.message,
    });
  }
});




// DELETE: Delete a Second-Hand Product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await SecondHandProduct.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Second-hand product not found." });
    }

    res.status(200).json({
      message: "Second-hand product deleted successfully!",
      deletedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting second-hand product",
      error: error.message,
    });
  }
});


// GET: Sales Report
router.get("/sales/report", async (req, res) => {
  try {
    const sales = await SaleTransaction.find();

    if (!sales.length) {
      return res.status(404).json({ message: "No sales transactions found." });
    }

    let totalSales = 0;
    let totalQuantitySold = 0;

    sales.forEach((sale) => {
      totalSales += sale.totalAmount;
      totalQuantitySold += sale.quantitySold;
    });

    res.status(200).json({
      message: "Sales report generated successfully.",
      totalSales,
      totalQuantitySold,
      sales,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error generating the sales report",
        error: error.message,
      });
  }
});

export default router;
