import Sales from '../models/Sales.js';
import Product from '../models/Product.js';

export const createSale = async (req, res) => {
  try {
    const sale = new Sales(req.body);

    // Validate stock availability
    for (const item of sale.products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for product ID: ${item.productId}` });
      }
    }

    // Deduct stock
    for (const item of sale.products) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }

    const savedSale = await sale.save();
    res.status(201).json(savedSale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getSalesReport = async (req, res) => {
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
        productSummary[productId].revenueGenerated += item.quantity * item.salePrice;
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
};
