export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN-PROGRESS' | 'DONE';
  assignedTo: string | User;
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  taskId: string | Task;
  createdAt: string;
}

