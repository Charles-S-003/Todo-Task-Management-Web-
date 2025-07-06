import React, { useState } from 'react';

const TodoList = ({ tasks, onUpdateStatus, onDeleteTask }) => {
  const [filter, setFilter] = useState('all');

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">📝</div>
            <p className="text-gray-500">
              {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Create a new task to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className={`border border-gray-200 rounded-lg p-4 ${
                  task.status === 'completed' ? 'bg-gray-50' : 'bg-white'
                } ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'border-red-200' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3
                        className={`font-medium ${
                          task.status === 'completed'
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p
                        className={`text-sm mb-2 ${
                          task.status === 'completed'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <span
                          className={`${
                            isOverdue(task.dueDate) && task.status !== 'completed'
                              ? 'text-red-600 font-medium'
                              : ''
                          }`}
                        >
                          📅 {formatDate(task.dueDate)}
                          {isOverdue(task.dueDate) && task.status !== 'completed' && ' (Overdue)'}
                        </span>
                      )}
                      
                      {task.owner && (
                        <span>👤 {task.owner.name}</span>
                      )}
                      
                      {task.sharedWith && task.sharedWith.length > 0 && (
                        <span>
                          👥 Shared with {task.sharedWith.length} user(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateStatus(task._id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <button
                      onClick={() => onDeleteTask(task._id)}
                      className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      title="Delete task"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoList;