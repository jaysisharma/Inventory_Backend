import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

// Models
import Product from './models/Product.js';
import Sales from './models/Sales.js';
import RepairService from './models/Repair.js';
import SecondHandProduct from './models/SecondHandProduct.js';
import SaleTransaction from './models/SaleTransaction.js';
import repairRouter from './routes/repairRoutes.js';
import connectDB from './config/db.js'
import productRouter from './routes/productRoutes.js';
import activityRoutes from './routes/activityRoutes.js';

import secondHandProductRouter from './routes/secondHandProductRoutes.js';
import cors from 'cors';
// Initialize App
const app = express();
app.use(cors());

app.use(bodyParser.json());
dotenv.config();

connectDB()

// API Endpoints

app.use('/api/repair-services', repairRouter);
app.use('/api/products', productRouter)
app.use('/api/second-hand-products', secondHandProductRouter)
app.use('/api/activities', activityRoutes);




// Get All Sales
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await Sales.find().populate('products.productId');
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate Sales Report
app.get('/api/sales/report', async (req, res) => {
  try {
    const sales = await Sales.find().populate('products.productId');

    if (!sales.length) {
      return res.status(404).json({ message: "No sales data available." });
    }

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSummary = {};

    sales.forEach(sale => {
      totalRevenue += sale.totalAmount;
      sale.products.forEach(item => {
        const productId = item.productId._id.toString();
        const productName = item.productId.name;

        totalItemsSold += item.quantity;

        if (!productSummary[productId]) {
          productSummary[productId] = {
            name: productName,
            quantitySold: 0,
            revenueGenerated: 0
          };
        }

        productSummary[productId].quantitySold += item.quantity;
        // Fix: Calculate revenue generated using the sale price
        productSummary[productId].revenueGenerated += item.quantity * item.salePrice; // Using item.salePrice instead of productId.price
      });
    });

    const report = {
      totalRevenue,
      totalItemsSold,
      productSummary: Object.values(productSummary)
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Repair Service Routes


// Get Total Revenue for All Sales (Products, Second-hand Products, and Repair Services)


// // app.post('/api/repair-services', async (req, res) => {
// //   // const { productName, customerName, customerEmail, issueDescription, repairCost, repairStatus } = req.body;

// //   try {
// //     const repair = new RepairService(req.body);
// //     const savedrepair = await repair.save();
// //     res.status(201).json(savedrepair);

// //     // res.status(201).json({ message: 'Repair service created successfully!', data: newRepairService });
// //   } catch (error) {
// //     res.status(500).json({ message: 'Error creating repair service', error: error.message });
// //   }
// // });


// // Generate Repair Service Report
app.get('/api/report', async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res.status(404).json({ message: "No repair service data available." });
    }

    let totalRepairCost = 0;
    let totalRepairs = repairServices.length;
    const statusSummary = { Pending: 0, 'In Progress': 0, Completed: 0, Canceled: 0 };
    const productSummary = {
      Camera: { repairsCount: 0, totalRepairCost: 0 },
      Drone: { repairsCount: 0, totalRepairCost: 0 },
      LED: { repairsCount: 0, totalRepairCost: 0 },
      Others: { repairsCount: 0, totalRepairCost: 0 },
    };

    repairServices.forEach(repair => {
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

// // Second-Hand Product Routes
// app.post('/api/second-hand-products', async (req, res) => {
//   const { name, description, price, stock, category, condition } = req.body;
//   try {
//     const newSecondHandProduct = new SecondHandProduct({
//       name,
//       description,
//       price,
//       stock,
//       category,
//       condition,
//     });
//     await newSecondHandProduct.save();
//     res.status(201).json({ message: 'Second-hand product created successfully!', data: newSecondHandProduct });
//   } catch (error) {
//     res.status(500).json({ message: 'Error creating second-hand product', error: error.message });
//   }
// });

// // POST: Sell a Second-Hand Product (with SaleTransaction logging)
// app.post('/api/second-hand-products/sell', async (req, res) => {
//   const { productId, quantitySold } = req.body;

//   try {
//     const secondHandProduct = await SecondHandProduct.findById(productId);

//     if (!secondHandProduct) {
//       return res.status(404).json({ message: "Second-hand product not found." });
//     }

//     if (secondHandProduct.stock < quantitySold) {
//       return res.status(400).json({ message: "Not enough stock available to sell." });
//     }

//     secondHandProduct.stock -= quantitySold;
//     await secondHandProduct.save();

//     // Record the sale transaction in SaleTransaction model
//     const saleTransaction = new SaleTransaction({
//       productId: secondHandProduct._id,
//       productName: secondHandProduct.name,
//       quantitySold,
//       salePrice: secondHandProduct.price,
//       totalAmount: secondHandProduct.price * quantitySold,
//     });

//     await saleTransaction.save();

//     res.status(200).json({
//       message: 'Second-hand product sold successfully!',
//       saleTransaction,
//       remainingStock: secondHandProduct.stock,
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error processing the sale', error: error.message });
//   }
// });

// // GET: Retrieve all Second-Hand Products
// app.get('/api/second-hand-products', async (req, res) => {
//   try {
//     const secondHandProducts = await SecondHandProduct.find();
//     if (!secondHandProducts.length) {
//       return res.status(404).json({ message: "No second-hand products found." });
//     }

//     res.status(200).json({
//       message: "Second-hand products retrieved successfully.",
//       data: secondHandProducts,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error retrieving second-hand products", error: error.message });
//   }
// });

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
