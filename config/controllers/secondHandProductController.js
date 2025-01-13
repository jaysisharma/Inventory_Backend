import SecondHandProduct from '../models/SecondHandProduct.js';
import SaleTransaction from '../models/SaleTransaction.js';

export const createSecondHandProduct = async (req, res) => {
  const { name, description, price, stock, category, condition } = req.body;
  try {
    const newSecondHandProduct = new SecondHandProduct({
      name,
      description,
      price,
      stock,
      category,
      condition,
    });
    await newSecondHandProduct.save();
    res.status(201).json({ message: 'Second-hand product created successfully!', data: newSecondHandProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error creating second-hand product', error: error.message });
  }
};

export const sellSecondHandProduct = async (req, res) => {
  const { productId, quantitySold } = req.body;

  try {
    const secondHandProduct = await SecondHandProduct.findById(productId);

    if (!secondHandProduct) {
      return res.status(404).json({ message: "Second-hand product not found." });
    }

    if (secondHandProduct.stock < quantitySold) {
      return res.status(400).json({ message: "Not enough stock available to sell." });
    }

    secondHandProduct.stock -= quantitySold;
    await secondHandProduct.save();

    const saleTransaction = new SaleTransaction({
      productId: secondHandProduct._id,
      productName: secondHandProduct.name,
      quantitySold,
      salePrice: secondHandProduct.price,
      totalAmount: secondHandProduct.price * quantitySold,
    });

    await saleTransaction.save();

    res.status(200).json({
      message: 'Second-hand product sold successfully!',
      saleTransaction,
      remainingStock: secondHandProduct.stock,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing the sale', error: error.message });
  }
};
