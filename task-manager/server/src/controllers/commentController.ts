import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Task from '../models/Task';

export const getCommentsForTask = async (req: Request, res: Response) => {
  const { taskId } = req.params;

  try {
    const comments = await Comment.find({ taskId }).populate('author');
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};


export const addCommentToTask = async (req: Request, res: Response): Promise<void> => {
  const { text } = req.body;
  const { taskId } = req.params;

  try {
    const task = await Task.findById(taskId);

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    let comment;

    if (task.comment) {
      comment = await Comment.findByIdAndUpdate(
        task.comment,
        { text },
        { new: true }
      );
    } else {
      comment = await Comment.create({
        text,
        taskId,
      });

      task.comment = comment._id;
      await task.save();
    }

    if (!comment) {
      res.status(500).json({ message: 'Failed to create or update comment' });
      return;
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding or updating comment' });
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find().populate('author').populate('taskId');
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching all comments:', error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { text } = req.body;

  try {
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { text },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    await Task.updateOne(
      { comment: commentId },
      { $unset: { comment: '' } }
    );
    
    res.status(200).json({ message: 'Comment deleted and task updated successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};
