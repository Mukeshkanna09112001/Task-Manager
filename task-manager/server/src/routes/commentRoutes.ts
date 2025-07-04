import express from 'express';
import {
  getCommentsForTask,
  addCommentToTask,
  getAllComments,
  updateComment,
  deleteComment,
} from '../controllers/commentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/tasks/:taskId/comments', protect, getCommentsForTask);
router.post('/tasks/:taskId/comments', protect, addCommentToTask);
router.get('/comments', protect, getAllComments);
router.put('/comments/:commentId', protect, updateComment);
router.delete('/comments/:commentId', protect, deleteComment);

export default router;
