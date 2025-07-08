import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Comment', commentSchema);
