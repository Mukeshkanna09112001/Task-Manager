import mongoose from 'mongoose';

// models/Task.ts
const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ['TODO', 'IN-PROGRESS', 'DONE'],
    default: 'TODO',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
}, { timestamps: true });


export default mongoose.model('Task', taskSchema);
