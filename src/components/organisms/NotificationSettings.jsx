import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const NotificationSettings = ({ isOpen, onClose, settings, onSave, tasks }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  const [notificationPermission, setNotificationPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const requestNotificationPermission = async () => {
    if (typeof Notification === 'undefined') {
      toast.error("Notifications not supported in this browser");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        toast.success("Notifications enabled successfully!");
      } else {
        toast.error("Notification permission denied");
      }
    } catch (error) {
      toast.error("Failed to request notification permission");
    }
  };

  const handleToggleCategory = (category) => {
    setLocalSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
    toast.success("Notification settings saved!");
  };

  const testNotification = () => {
    if (notificationPermission !== 'granted') {
      toast.error("Please enable notifications first");
      return;
    }

    new Notification("FarmLog Pro - Test Notification", {
      body: "This is a test reminder for your farm tasks",
      icon: "/favicon.ico",
      tag: "test-notification"
    });
    
    toast.success("Test notification sent!");
  };

  const getUpcomingReminders = () => {
    const now = new Date();
    const reminderTime = localSettings.reminderMinutes * 60 * 1000;
    
    return tasks.filter(task => {
      if (task.completed) return false;
      
      const taskTime = new Date(task.dueDate).getTime();
      const timeUntilReminder = taskTime - reminderTime - now.getTime();
      
      return timeUntilReminder > 0 && timeUntilReminder <= 24 * 60 * 60 * 1000; // Next 24 hours
    });
  };

  const upcomingReminders = getUpcomingReminders();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Permission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Bell" size={20} />
                <span>Browser Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Notification Permission</p>
                  <p className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${
                      notificationPermission === 'granted' ? 'text-green-600' : 
                      notificationPermission === 'denied' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {notificationPermission === 'granted' ? 'Enabled' : 
                       notificationPermission === 'denied' ? 'Denied' : 'Not Requested'}
                    </span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  {notificationPermission !== 'granted' && (
                    <Button onClick={requestNotificationPermission}>
                      Enable Notifications
                    </Button>
                  )}
                  {notificationPermission === 'granted' && (
                    <Button variant="outline" onClick={testNotification}>
                      Test Notification
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reminder Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Clock" size={20} />
                <span>Reminder Timing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind me before task due time
                </label>
                <Select
                  value={localSettings.reminderMinutes}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    reminderMinutes: parseInt(e.target.value)
                  }))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={360}>6 hours</option>
                  <option value={720}>12 hours</option>
                  <option value={1440}>1 day</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Task Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ApperIcon name="Filter" size={20} />
                <span>Task Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Choose which types of tasks you want to receive reminders for:
              </p>
              
              {Object.entries(localSettings.categories).map(([category, enabled]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ApperIcon 
                      name={
                        category === 'watering' ? 'Droplets' :
                        category === 'fertilizing' ? 'Sprout' :
                        category === 'harvesting' ? 'Scissors' :
                        category === 'planting' ? 'Seedling' :
                        category === 'maintenance' ? 'Wrench' :
                        'CheckSquare'
                      } 
                      size={18} 
                      className="text-primary-600" 
                    />
                    <span className="font-medium text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                  </div>
                  <Button
                    variant={enabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleCategory(category)}
                  >
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ApperIcon name="Calendar" size={20} />
                  <span>Upcoming Reminders</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  You have {upcomingReminders.length} reminder{upcomingReminders.length !== 1 ? 's' : ''} scheduled for the next 24 hours:
                </p>
                <div className="space-y-2">
                  {upcomingReminders.slice(0, 5).map(task => {
                    const reminderTime = new Date(new Date(task.dueDate).getTime() - (localSettings.reminderMinutes * 60 * 1000));
                    return (
                      <div key={task.Id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-900">{task.title}</span>
                        <span className="text-gray-600">
                          {reminderTime.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                  {upcomingReminders.length > 5 && (
                    <p className="text-sm text-gray-500">
                      ...and {upcomingReminders.length - 5} more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;