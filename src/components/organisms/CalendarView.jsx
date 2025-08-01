import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isAfter } from "date-fns";

const CalendarView = ({ tasks, onTaskSelect, onTaskComplete, getFarmName }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const tasksGroupedByDate = useMemo(() => {
    const grouped = {};
    tasks.forEach(task => {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [tasks]);

  const getTasksForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksGroupedByDate[dateKey] || [];
  };

  const getTaskPriority = (task) => {
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
              >
                <ApperIcon name="ChevronLeft" size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
              >
                <ApperIcon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map(day => {
              const dayTasks = getTasksForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const isTodayDate = isToday(day);

              return (
                <div
                  key={day.toString()}
                  className={`
                    min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'}
                    ${isTodayDate ? 'ring-2 ring-primary-300' : ''}
                  `}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`
                    text-sm font-medium mb-1
                    ${isTodayDate ? 'text-primary-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {dayTasks.length > 0 && (
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => {
                        const priority = getTaskPriority(task);
                        return (
                          <div
                            key={task.Id}
                            className={`
                              text-xs p-1 rounded truncate cursor-pointer
                              ${priority.variant === 'error' ? 'bg-red-100 text-red-800' :
                                priority.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                priority.variant === 'success' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'}
                            `}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskSelect(task);
                            }}
                          >
                            {task.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <Card>
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Tasks for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            
            {selectedDateTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tasks scheduled for this date</p>
            ) : (
              <div className="space-y-3">
                {selectedDateTasks.map(task => {
                  const priority = getTaskPriority(task);
                  return (
                    <div
                      key={task.Id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <ApperIcon name="CheckSquare" size={16} className="text-primary-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{task.title}</h5>
                          <p className="text-sm text-gray-600">
                            {task.type} • {getFarmName(task.farmId)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge variant={priority.variant}>
                          {priority.label}
                        </Badge>
                        {!task.completed && (
                          <Button
                            size="sm"
                            onClick={() => onTaskComplete(task.Id)}
                          >
                            <ApperIcon name="Check" size={14} className="mr-1" />
                            Complete
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onTaskSelect(task)}
                        >
                          <ApperIcon name="Edit" size={14} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarView;