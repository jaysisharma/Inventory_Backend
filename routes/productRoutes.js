import express from "express";
import Product from "../models/Product.js";
import Sales from "../models/Sales.js";
import Activity from "../models/activityModel.js";
const router = express.Router();

router.get("/sales/report", async (req, res) => {
  try {
    // Calculate the start and end dates for the current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1); // First day of the current month
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of the current month

    // Find sales within the current month
    const sales = await Sales.find({
      saleDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate("products.productId");

    if (!sales.length) {
      return res
        .status(404)
        .json({ message: "No sales data available for the current month." });
    }

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSummary = {};

    sales.forEach((sale) => {
      totalRevenue += sale.totalAmount;
      sale.products.forEach((item) => {
        if (!item.productId) {
          console.error("Missing productId in sale:", item); // Log the item with missing productId
          return; // Skip this item if productId is null or undefined
        }

        const productId = item.productId._id.toString();
        const productName = item.productId.name;

        totalItemsSold += item.quantity;

        if (!productSummary[productId]) {
          productSummary[productId] = {
            name: productName,
            quantitySold: 0,
            revenueGenerated: 0,
            saleDates: [], // Add an array for sale dates
          };
        }

        productSummary[productId].quantitySold += item.quantity;
        productSummary[productId].revenueGenerated +=
          item.quantity * item.salePrice;
        productSummary[productId].saleDates.push(sale.saleDate); // Store the sale date
      });
    });

    const report = {
      totalRevenue,
      totalItemsSold,
      productSummary: Object.values(productSummary),
      month: startOfMonth.toLocaleString("default", { month: "long" }),
      year: startOfMonth.getFullYear(),
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sales/year-report", async (req, res) => {
  try {
    // Calculate the start and end dates for the current year
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of the current year
    const endOfYear = new Date(today.getFullYear(), 11, 31); // December 31st of the current year

    // Find sales within the current year
    const sales = await Sales.find({
      saleDate: { $gte: startOfYear, $lte: endOfYear },
    }).populate("products.productId");

    if (!sales.length) {
      return res
        .status(404)
        .json({ message: "No sales data available for the current year." });
    }

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSummary = {};

    sales.forEach((sale) => {
      totalRevenue += sale.totalAmount;
      sale.products.forEach((item) => {
        if (!item.productId) {
          console.error("Missing productId in sale:", item); // Log the item with missing productId
          return; // Skip this item if productId is null or undefined
        }

        const productId = item.productId._id.toString();
        const productName = item.productId.name;

        totalItemsSold += item.quantity;

        if (!productSummary[productId]) {
          productSummary[productId] = {
            name: productName,
            quantitySold: 0,
            revenueGenerated: 0,
          };
        }

        productSummary[productId].quantitySold += item.quantity;
        productSummary[productId].revenueGenerated +=
          item.quantity * item.salePrice;
      });
    });

    const report = {
      totalRevenue,
      totalItemsSold,
      productSummary: Object.values(productSummary),
      year: startOfYear.getFullYear(),
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/sold-items', async (req, res) => {
  try {
    const sales = await Sales.find().populate('products.productId');
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a Product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    // Log the activity for creating a product
    const activityMessage = `Product "${product.name}" created with ID ${product._id}.`;
    const newActivity = new Activity({
      message: activityMessage,
      type: 'create',  // Activity type: 'create'
      user: req.user ? req.user._id : null,  // If you have user authentication
    });
    await newActivity.save(); // Save the activity to the database
    
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get All Products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a Single Product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a Product by ID
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    const activityMessage = `Updated "${updatedProduct.name}" created with ID ${updatedProduct._id}.`;
    const newActivity = new Activity({
      message: activityMessage,
      type: 'Updated',  // Activity type: 'create'
      user: req.user ? req.user._id : null,  // If you have user authentication
    });
    await newActivity.save(); // Save the activity to the database
    

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a Product by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const activityMessage = `Deleted "${deletedProduct.name}" created with ID ${deletedProduct._id}.`;
    const newActivity = new Activity({
      message: activityMessage,
      type: 'Deleted',  // Activity type: 'create'
      user: req.user ? req.user._id : null,  // If you have user authentication
    });
    await newActivity.save(); // Save the activity to the database
    
    res
      .status(200)
      .json({ message: "Product deleted successfully", deletedProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/sell", async (req, res) => {
  try {
    const sale = new Sales(req.body);

    // Validate stock availability
    for (const item of sale.products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res
          .status(400)
          .json({
            error: `Insufficient stock for product ID: ${item.productId}`,
          });
      }
    }

    // Deduct stock and log activity for each product sold
    for (const item of sale.products) {
      const product = await Product.findById(item.productId);

      // Deduct stock for the product
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });

      // Create an activity log for each product sold
      const activityMessage = `Sold "${product.name}" with quantity ${item.quantity} at price ${item.salePrice} for a total of ${req.body.totalAmount}.`;
      const newActivity = new Activity({
        message: activityMessage,
        type: "sell",  // Activity type: 'sell'
        user: req.user ? req.user._id : null,  // If you have user authentication
      });
      await newActivity.save(); // Save the activity to the database
    }

    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/products/low-stock", async (req, res) => {
  try {
    // Example: Assuming low stock is defined as stock < 10
    const lowStockThreshold = 10;

    // Find products where stock is less than the threshold
    const lowStockProducts = await Product.find({
      stock: { $lt: lowStockThreshold },
    });

    if (lowStockProducts.length === 0) {
      return res.status(404).json({ message: "No low-stock products found." });
    }

    res.status(200).json(lowStockProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export the router
export default router;
