import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    message: { type: String, required: true }, // The activity message to be shown in the feed
    timestamp: { type: Date, default: Date.now }, // Time when the activity occurred
    type: { type: String, required: true }, // The type of activity (create, update, delete, etc.)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // If you have a User model
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
