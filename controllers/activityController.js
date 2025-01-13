import Activity from '../models/activityModel.js';

const getActivitiesController = async (req, res) => {
  try {
    // Fetch activities, optionally with pagination or filtering if needed
    const activities = await Activity.find().sort({ timestamp: -1 }); // Sort by timestamp in descending order

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error });
  }
};

export { getActivitiesController };
