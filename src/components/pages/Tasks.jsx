import React, { useEffect, useState } from "react";
import CalendarView from "@/components/organisms/CalendarView";
import NotificationSettings from "@/components/organisms/NotificationSettings";
import { notificationService } from "@/services/api/notificationService";
import { toast } from "react-toastify";
import { endOfWeek, format, isAfter, isToday, startOfWeek } from "date-fns";
import taskService from "@/services/api/taskService";
import farmService from "@/services/api/farmService";
import ApperIcon from "@/components/ApperIcon";
import TaskCard from "@/components/molecules/TaskCard";
import Header from "@/components/organisms/Header";
import AddTaskModal from "@/components/organisms/AddTaskModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Farms from "@/components/pages/Farms";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterFarm, setFilterFarm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [filterType, setFilterType] = useState("");
  const [viewMode, setViewMode] = useState("list"); // "list" or "calendar"
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    enabled: true,
    reminderMinutes: 60,
    categories: {
      watering: true,
      fertilizing: true,
      harvesting: true,
      planting: true,
      maintenance: true,
      pest_control: true
    }
  });
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tasksData, farmsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll()
      ]);
      
      setTasks(tasksData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load tasks data");
      console.error("Tasks data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    loadData();
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = () => {
    try {
      const saved = localStorage.getItem('farmlog-notification-settings');
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const handleNotificationSettings = (settings) => {
    setNotificationSettings(settings);
    notificationService.saveSettings(settings);
    
    // Restart monitoring with new settings
    notificationService.startMonitoring(tasks);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) return;

      const updatedTask = await taskService.update(taskId, { 
        completed: true, 
        completedDate: new Date().toISOString() 
      });
      
      setTasks(prev => prev.map(t => 
        t.Id === taskId ? updatedTask : t
      ));
      
      toast.success("Task completed successfully!");
    } catch (error) {
      toast.error("Failed to complete task");
      console.error("Task completion error:", error);
    }
  };

const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.Id, taskData);
        setTasks(prev => prev.map(task => 
          task.Id === editingTask.Id ? updatedTask : task
        ));
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(taskData);
        setTasks(prev => [...prev, newTask]);
        toast.success("Task added successfully!");
      }
      
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save task");
      console.error("Task save error:", error);
    }
  };

  // Filter and sort tasks

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const farmMatch = !filterFarm || task.farmId === parseInt(filterFarm);
    const typeMatch = !filterType || task.type === filterType;
    
    let statusMatch = true;
    if (filterStatus === "pending") {
      statusMatch = !task.completed;
    } else if (filterStatus === "completed") {
      statusMatch = task.completed;
    } else if (filterStatus === "overdue") {
      statusMatch = !task.completed && isAfter(new Date(), new Date(task.dueDate));
    } else if (filterStatus === "today") {
      statusMatch = !task.completed && isToday(new Date(task.dueDate));
    }
    
    return farmMatch && typeMatch && statusMatch;
  }).sort((a, b) => {
    // Sort by due date, with overdue first
    const aDate = new Date(a.dueDate);
    const bDate = new Date(b.dueDate);
    const now = new Date();
    
    const aOverdue = isAfter(now, aDate) && !a.completed;
    const bOverdue = isAfter(now, bDate) && !b.completed;
    
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    
    return aDate - bDate;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  // Get task statistics
  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
    overdue: tasks.filter(t => !t.completed && isAfter(new Date(), new Date(t.dueDate))).length,
    today: tasks.filter(t => !t.completed && isToday(new Date(t.dueDate))).length
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

return (
    <div className="space-y-6 p-6">
      <Header 
        title="Task Management" 
        subtitle="Schedule and track your farm activities with reminders"
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <ApperIcon name="Bell" size={16} className="mr-2" />
            Notifications
          </Button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="px-3 py-1 text-xs"
            >
              <ApperIcon name="List" size={14} className="mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="px-3 py-1 text-xs"
            >
              <ApperIcon name="Calendar" size={14} className="mr-1" />
              Calendar
            </Button>
          </div>
          <Button onClick={handleAddTask}>
            <ApperIcon name="Plus" size={16} className="mr-2" />
            Add Task
          </Button>
        </div>
      </Header>

{/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{taskStats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-success">{taskStats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-error">{taskStats.overdue}</div>
          <div className="text-sm text-gray-600">Overdue</div>
        </div>
        <div className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-warning">{taskStats.today}</div>
          <div className="text-sm text-gray-600">Due Today</div>
        </div>
      </div>

      {/* Render Calendar or List View */}
      {viewMode === "calendar" ? (
        <CalendarView
          tasks={filteredTasks}
          onTaskSelect={handleEditTask}
          onTaskComplete={handleCompleteTask}
          getFarmName={getFarmName}
        />
      ) : (
        <>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-4">
          <div className="min-w-48">
            <Select
              value={filterFarm}
              onChange={(e) => setFilterFarm(e.target.value)}
              className="text-sm"
            >
              <option value="">All Farms</option>
              {farms.map((farm) => (
                <option key={farm.Id} value={farm.Id}>
                  {farm.name}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="min-w-48">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-sm"
            >
              <option value="pending">Pending Tasks</option>
              <option value="completed">Completed Tasks</option>
              <option value="overdue">Overdue Tasks</option>
              <option value="today">Due Today</option>
              <option value="">All Tasks</option>
            </Select>
          </div>
          
          <div className="min-w-48">
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-sm"
            >
              <option value="">All Types</option>
              <option value="watering">Watering</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="harvesting">Harvesting</option>
              <option value="planting">Planting</option>
              <option value="maintenance">Maintenance</option>
              <option value="pest_control">Pest Control</option>
            </Select>
          </div>
          
          {(filterFarm || filterType || filterStatus !== "pending") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterFarm("");
                setFilterType("");
                setFilterStatus("pending");
              }}
            >
              <ApperIcon name="X" size={14} className="mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <Empty
          title={tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
          description={tasks.length === 0 
            ? "Start by creating your first farm task to keep track of your activities" 
            : "Try adjusting your filters to see more tasks"
          }
          icon="CheckSquare"
          actionLabel={tasks.length === 0 ? "Create Your First Task" : "Add New Task"}
          onAction={handleAddTask}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              {filterFarm && ` from ${getFarmName(parseInt(filterFarm))}`}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.Id}
                task={task}
                onComplete={handleCompleteTask}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        </>
      )}

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
onSave={handleSaveTask}
        task={editingTask}
      />
        </>
      )}
      <NotificationSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={notificationSettings}
        onSave={handleNotificationSettings}
        tasks={tasks}
      />
    </div>
  );
};

export default Tasks;