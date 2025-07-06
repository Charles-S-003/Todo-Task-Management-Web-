import React, { useState, useEffect } from 'react';
import TodoList from './TodoList';

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    sharedWith: []
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        const task = await response.json();
        setTasks([task, ...tasks]);
        setNewTask({ title: '', description: '', dueDate: '', priority: 'medium', sharedWith: [] });
        setShowAddForm(false);
        setShareEmail('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(task => 
          task._id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addShareEmail = () => {
    if (shareEmail.trim() && !newTask.sharedWith.includes(shareEmail.trim())) {
      setNewTask({
        ...newTask,
        sharedWith: [...newTask.sharedWith, shareEmail.trim()]
      });
      setShareEmail('');
    }
  };

  const removeShareEmail = (email) => {
    setNewTask({
      ...newTask,
      sharedWith: newTask.sharedWith.filter(e => e !== email)
    });
  };

  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Todo Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your tasks efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-slate-50 rounded-full border border-slate-200">
                <div className="relative">
                  <img
                    className="h-10 w-10 rounded-full ring-2 ring-blue-500 ring-offset-2"
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=3B82F6&color=fff&bold=true`}
                    alt={user.name}
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-blue-100 text-lg">
                  You have {pendingTasks + inProgressTasks} active tasks to focus on today.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-yellow-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold text-slate-800">{pendingTasks}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-blue-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">In Progress</p>
                  <p className="text-3xl font-bold text-slate-800">{inProgressTasks}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-green-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold text-slate-800">{completedTasks}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="group relative inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2"
          >
            <svg className={`w-5 h-5 transition-transform duration-200 ${showAddForm ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showAddForm ? 'Cancel' : 'Add New Task'}</span>
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-200 mb-8 animate-in slide-in-from-top duration-300">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Create New Task</h3>
            </div>
            
            <form onSubmit={createTask} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter task title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm resize-none"
                  placeholder="Add task description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    <option value="low">🟢 Low Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="high">🔴 High Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Share with Team Members
                </label>
                <div className="flex gap-3 mb-3">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={addShareEmail}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors duration-200 font-medium"
                  >
                    Add
                  </button>
                </div>
                {newTask.sharedWith.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newTask.sharedWith.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeShareEmail(email)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2"
                >
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Your Tasks</h3>
            <p className="text-sm text-slate-600 mt-1">Manage and track your daily tasks</p>
          </div>
          <TodoList
            tasks={tasks}
            onUpdateStatus={updateTaskStatus}
            onDeleteTask={deleteTask}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;