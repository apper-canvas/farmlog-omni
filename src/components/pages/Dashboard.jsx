import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import StatCard from "@/components/molecules/StatCard";
import WeatherCard from "@/components/molecules/WeatherCard";
import FarmCard from "@/components/molecules/FarmCard";
import TaskCard from "@/components/molecules/TaskCard";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import transactionService from "@/services/api/transactionService";
import { toast } from "react-toastify";
import { isAfter, isToday, addDays } from "date-fns";

const Dashboard = () => {
  const { weather } = useOutletContext();
  const [data, setData] = useState({
    farms: [],
    crops: [],
    tasks: [],
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [farms, crops, tasks, transactions] = await Promise.all([
        farmService.getAll(),
        cropService.getAll(),
        taskService.getAll(),
        transactionService.getAll()
      ]);
      
      setData({ farms, crops, tasks, transactions });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Dashboard data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteTask = async (taskId) => {
    try {
      const task = data.tasks.find(t => t.Id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          completed: true,
          completedDate: new Date().toISOString()
        };
        
        await taskService.update(taskId, updatedTask);
        
        setData(prev => ({
          ...prev,
          tasks: prev.tasks.map(t => t.Id === taskId ? updatedTask : t)
        }));
        
        toast.success("Task completed successfully!");
      }
    } catch (error) {
      toast.error("Failed to complete task");
      console.error("Task completion error:", error);
    }
  };

  // Calculate statistics
  const stats = {
    totalFarms: data.farms.length,
    activeCrops: data.crops.filter(crop => crop.status === "active").length,
    upcomingTasks: data.tasks.filter(task => !task.completed).length,
    totalExpenses: data.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
    totalIncome: data.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)
  };

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = data.tasks
    .filter(task => !task.completed)
    .filter(task => {
      const dueDate = new Date(task.dueDate);
      const weekFromNow = addDays(new Date(), 7);
      return dueDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  // Get overdue tasks
  const overdueTasks = data.tasks
    .filter(task => !task.completed && isAfter(new Date(), new Date(task.dueDate)))
    .length;

  // Get crops ready for harvest
  const cropsReadyToHarvest = data.crops
    .filter(crop => 
      crop.status === "active" && 
      (crop.growthStage === "ready" || isAfter(new Date(), new Date(crop.expectedHarvest)))
    ).length;

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Farm Dashboard" 
        subtitle="Overview of your farming operations"
        weather={weather}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Farms"
          value={stats.totalFarms}
          icon="Wheat"
          trend={stats.totalFarms > 0 ? "up" : null}
          trendValue={stats.totalFarms > 0 ? "Active" : null}
        />
        
        <StatCard
          title="Active Crops"
          value={stats.activeCrops}
          icon="Sprout"
          trend={cropsReadyToHarvest > 0 ? "up" : null}
          trendValue={cropsReadyToHarvest > 0 ? `${cropsReadyToHarvest} ready` : null}
        />
        
        <StatCard
          title="Pending Tasks"
          value={stats.upcomingTasks}
          icon="CheckSquare"
          trend={overdueTasks > 0 ? "down" : null}
          trendValue={overdueTasks > 0 ? `${overdueTasks} overdue` : null}
        />
        
        <StatCard
          title="Net Profit"
          value={`$${(stats.totalIncome - stats.totalExpenses).toLocaleString()}`}
          icon="DollarSign"
          trend={stats.totalIncome > stats.totalExpenses ? "up" : "down"}
          trendValue={`${((stats.totalIncome / (stats.totalExpenses || 1) - 1) * 100).toFixed(1)}%`}
          valueColor={stats.totalIncome > stats.totalExpenses ? "text-success" : "text-error"}
        />
      </div>

      {/* Weather Alert */}
      {weather && weather.alerts && weather.alerts.length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Weather Alert</h3>
              <p className="text-yellow-700 text-sm">{weather.alerts[0]}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Farms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Farms</h2>
            <Button size="sm" onClick={() => window.location.href = "/farms"}>
              <ApperIcon name="Plus" size={16} className="mr-1" />
              Add Farm
            </Button>
          </div>
          
          {data.farms.length === 0 ? (
            <Empty
              title="No farms yet"
              description="Start by adding your first farm to track your operations"
              icon="Wheat"
              actionLabel="Add Your First Farm"
              onAction={() => window.location.href = "/farms"}
            />
          ) : (
            <div className="space-y-4">
              {data.farms.slice(0, 2).map((farm) => {
                const activeCrops = data.crops.filter(crop => 
                  crop.farmId === farm.Id && crop.status === "active"
                ).length;
                
                return (
                  <FarmCard
                    key={farm.Id}
                    farm={farm}
                    activeCrops={activeCrops}
                    onView={() => window.location.href = `/farms/${farm.Id}`}
                    onEdit={() => window.location.href = "/farms"}
                  />
                );
              })}
              
              {data.farms.length > 2 && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/farms"}
                >
                  View All Farms ({data.farms.length})
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h2>
            <Button size="sm" onClick={() => window.location.href = "/tasks"}>
              <ApperIcon name="Plus" size={16} className="mr-1" />
              Add Task
            </Button>
          </div>
          
          {upcomingTasks.length === 0 ? (
            <Empty
              title="No upcoming tasks"
              description="All caught up! Schedule your next farming tasks"
              icon="CheckSquare"
              actionLabel="Add Task"
              onAction={() => window.location.href = "/tasks"}
            />
          ) : (
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <TaskCard
                  key={task.Id}
                  task={task}
                  onComplete={handleCompleteTask}
                  onEdit={() => window.location.href = "/tasks"}
                />
              ))}
              
              {data.tasks.filter(t => !t.completed).length > upcomingTasks.length && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/tasks"}
                >
                  View All Tasks ({data.tasks.filter(t => !t.completed).length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;