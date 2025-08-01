import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format, isAfter, isToday } from "date-fns";

const TaskCard = ({ task, onComplete, onEdit }) => {
  const getTaskPriority = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    
    if (isAfter(today, dueDate) && !task.completed) {
      return { variant: "error", label: "Overdue" };
    }
    if (isToday(dueDate) && !task.completed) {
      return { variant: "warning", label: "Due Today" };
    }
    if (task.completed) {
      return { variant: "success", label: "Completed" };
    }
    return { variant: "info", label: "Upcoming" };
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case "watering": return "Droplets";
      case "fertilizing": return "Sprout";
      case "harvesting": return "Scissors";
      case "planting": return "Seedling";
      case "maintenance": return "Wrench";
      default: return "CheckSquare";
    }
  };

  const priority = getTaskPriority();

return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
              <ApperIcon 
                name={getTaskIcon(task.type)} 
                size={18} 
                className="text-primary-600" 
              />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{task.title}</h4>
              <p className="text-sm text-gray-600">{task.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {task.reminderEnabled && !task.completed && (
              <ApperIcon 
                name="Bell" 
                size={16} 
                className="text-warning" 
                title="Reminder enabled"
              />
            )}
            <Badge variant={priority.variant}>
              {priority.label}
            </Badge>
          </div>
        </div>
        
<div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Calendar" size={14} className="mr-2" />
            Due: {format(new Date(task.dueDate), "MMM dd, yyyy 'at' h:mm a")}
          </div>
          {task.reminderTime && !task.completed && (
            <div className="flex items-center text-sm text-warning">
              <ApperIcon name="Bell" size={14} className="mr-2" />
              Reminder: {task.reminderTime} minutes before
            </div>
          )}
          {task.notes && (
            <p className="text-sm text-gray-700">{task.notes}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {!task.completed && (
            <Button
              size="sm"
              onClick={() => onComplete(task.Id)}
              className="flex-1"
            >
              <ApperIcon name="Check" size={14} className="mr-1" />
              Complete
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onEdit(task)}
            className="px-3"
          >
            <ApperIcon name="Edit" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;