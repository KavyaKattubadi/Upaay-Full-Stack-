import React, { useState, useEffect, useReducer, createContext, useContext } from 'react';

// Tailwind CSS is assumed to be available
// We will use inline styles or simple characters instead of react-icons
const AddIcon = () => <span className="mr-2">+</span>;
const DeleteIcon = () => <span>&times;</span>;
const SearchIcon = () => <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>;

// --- Redux-like State Management ---

// Context for the store
const TaskContext = createContext();

// Action types
const ADD_TASK = 'ADD_TASK';
const MOVE_TASK = 'MOVE_TASK';
const DELETE_TASK = 'DELETE_TASK';

// Initial state, loaded from Local Storage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('taskAppState');
    if (serializedState === null) {
      return {
        columns: {
          'todo': {
            id: 'todo',
            title: 'To Do',
            tasks: [
              { id: '1', title: 'Design Homepage', description: 'Create a responsive homepage design based on the wireframes.', category: 'Design', priority: 'High', dueDate: '2023-10-25' },
              { id: '2', title: 'Setup Database', description: 'Configure the PostgreSQL database and create necessary tables.', category: 'Backend', priority: 'Medium', dueDate: '2023-10-28' },
            ],
          },
          'in-progress': {
            id: 'in-progress',
            title: 'In Progress',
            tasks: [
              { id: '3', title: 'Develop API endpoints', description: 'Build and test RESTful APIs for user authentication and data retrieval.', category: 'Backend', priority: 'High', dueDate: '2023-11-05' },
            ],
          },
          'done': {
            id: 'done',
            title: 'Done',
            tasks: [
              { id: '4', title: 'Fix deployment bug', description: 'Resolved the issue with the deployment script on Vercel.', category: 'DevOps', priority: 'Low', dueDate: '2023-10-15' },
            ],
          },
        },
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from Local Storage:", err);
    return undefined;
  }
};

const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('taskAppState', serializedState);
  } catch (err) {
    console.error("Error saving state to Local Storage:", err);
  }
};

// Reducer
const taskReducer = (state, action) => {
  switch (action.type) {
    case ADD_TASK:
      const newTaskId = Date.now().toString();
      const newColumn = { ...state.columns[action.payload.columnId] };
      newColumn.tasks = [...newColumn.tasks, { ...action.payload.task, id: newTaskId }];
      return {
        ...state,
        columns: {
          ...state.columns,
          [action.payload.columnId]: newColumn,
        },
      };

    case MOVE_TASK:
      const {
        sourceColumnId,
        destinationColumnId,
        taskId
      } = action.payload;
      const startColumn = state.columns[sourceColumnId];
      const endColumn = state.columns[destinationColumnId];
      const movedTask = startColumn.tasks.find(task => task.id === taskId);
      if (!movedTask) return state;

      const newStartTasks = startColumn.tasks.filter(task => task.id !== taskId);
      const newEndTasks = [...endColumn.tasks, movedTask];

      return {
        ...state,
        columns: {
          ...state.columns,
          [sourceColumnId]: { ...startColumn, tasks: newStartTasks },
          [destinationColumnId]: { ...endColumn, tasks: newEndTasks },
        },
      };

    case DELETE_TASK:
      const { columnId, taskId: taskIdToDelete } = action.payload;
      const columnToDeleteFrom = state.columns[columnId];
      const filteredTasks = columnToDeleteFrom.tasks.filter(task => task.id !== taskIdToDelete);
      return {
        ...state,
        columns: {
          ...state.columns,
          [columnId]: { ...columnToDeleteFrom, tasks: filteredTasks }
        }
      };

    default:
      return state;
  }
};

// --- Components ---

// TaskCard Component
const TaskCard = ({ task, columnId }) => {
  const { dispatch } = useContext(TaskContext);

  const handleDelete = () => {
    console.log(`Deleting task: ${task.title}`);
    dispatch({ type: DELETE_TASK, payload: { columnId, taskId: task.id } });
  };

  const handleMove = (e) => {
    const newColumnId = e.target.value;
    if (newColumnId) {
      dispatch({
        type: MOVE_TASK,
        payload: {
          sourceColumnId: columnId,
          destinationColumnId: newColumnId,
          taskId: task.id,
        }
      });
    }
  };

  return (
    <div className="bg-white p-4 my-2 rounded-lg shadow-md border border-gray-200 transition-all duration-200 ease-in-out">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <DeleteIcon />
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      <div className="flex flex-wrap items-center text-xs text-gray-500 gap-2">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{task.category}</span>
        <span className={`px-2 py-1 rounded-full font-medium ${task.priority === 'High' ? 'bg-red-100 text-red-800' : task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{task.priority}</span>
      </div>
      <div className="mt-3">
        <label className="block text-xs font-medium text-gray-700 mb-1">Move to:</label>
        <select
          onChange={handleMove}
          className="w-full p-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={columnId}
        >
          <option value="" disabled>Select a column</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
};

// TaskColumn Component
const TaskColumn = ({ column }) => {
  const { dispatch } = useContext(TaskContext);
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const handleAddTask = () => {
    if (taskTitle.trim() && taskDescription.trim()) {
      dispatch({
        type: ADD_TASK,
        payload: {
          columnId: column.id,
          task: {
            title: taskTitle,
            description: taskDescription,
            category: 'General',
            priority: 'Low',
          },
        },
      });
      setTaskTitle('');
      setTaskDescription('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-gray-100 rounded-2xl p-4 shadow-xl flex-1 max-w-sm w-full min-w-80 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4 sticky top-0 bg-gray-100 pb-2">
        {column.title} <span className="text-gray-500 font-normal">({column.tasks.length})</span>
      </h2>
      <div className="flex-1 overflow-y-auto px-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>

      <div className="mt-4">
        {isAdding ? (
          <div className="p-3 bg-white rounded-lg shadow-inner">
            <input
              type="text"
              placeholder="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full mb-2 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Task Description"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full mb-2 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="3"
            />
            <div className="flex justify-between">
              <button
                onClick={handleAddTask}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center w-full bg-indigo-100 text-indigo-800 p-3 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
          >
            <AddIcon /> Add a task
          </button>
        )}
      </div>
    </div>
  );
};

// Main App Component
const Dashboard = () => {
  const [state, dispatch] = useReducer(taskReducer, undefined, loadState);
  const [filterText, setFilterText] = useState('');

  // Save state to local storage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Filter tasks based on search input
  const filterTasks = (tasks) => {
    if (!filterText) {
      return tasks;
    }
    const lowercasedFilter = filterText.toLowerCase();
    return tasks.filter(
      (task) =>
      task.title.toLowerCase().includes(lowercasedFilter) ||
      task.description.toLowerCase().includes(lowercasedFilter)
    );
  };

  const filteredColumns = {
    'todo': {
      ...state.columns['todo'],
      tasks: filterTasks(state.columns['todo'].tasks)
    },
    'in-progress': {
      ...state.columns['in-progress'],
      tasks: filterTasks(state.columns['in-progress'].tasks)
    },
    'done': {
      ...state.columns['done'],
      tasks: filterTasks(state.columns['done'].tasks)
    },
  };

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-gray-50 font-sans p-6 text-gray-800">
        {/* Header and Filter */}
        <div className="mb-6 sticky top-0 z-10 bg-gray-50 pb-4">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Project Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your tasks with ease.</p>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2 mt-4 max-w-lg">
            <div className="relative w-full">
              <SearchIcon />
              <input
                type="text"
                placeholder="Filter tasks by title or description..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full p-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
          {Object.values(filteredColumns).map((column) => (
            <TaskColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </TaskContext.Provider>
  );
};

export default Dashboard;