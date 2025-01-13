import RepairService from '../models/Repair.js';

export const getRepairServices = async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res.status(404).json({ message: "No repair services found." });
    }
    res.status(200).json({ message: "Repair services retrieved successfully.", data: repairServices });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving repair services", error: error.message });
  }
};

export const createRepairService = async (req, res) => {
  const { productName, customerName, customerEmail, issueDescription, repairCost, repairStatus } = req.body;

  try {
    const newRepairService = new RepairService({
      productName,
      customerName,
      customerEmail,
      issueDescription,
      repairCost,
      repairStatus,
    });

    await newRepairService.save();
    res.status(201).json({ message: 'Repair service created successfully!', data: newRepairService });
  } catch (error) {
    res.status(500).json({ message: 'Error creating repair service', error: error.message });
  }
};

export const getRepairReport = async (req, res) => {
  try {
    const repairServices = await RepairService.find();
    if (!repairServices.length) {
      return res.status(404).json({ message: "No repair service data available." });
    }

    let totalRepairCost = 0;
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
      statusSummary,
      productSummary,
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
