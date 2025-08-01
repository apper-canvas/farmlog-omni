import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";

const AddTaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    cropId: "",
    title: "",
    type: "watering",
    dueDate: "",
    notes: ""
  });

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [farmsData, cropsData] = await Promise.all([
          farmService.getAll(),
          cropService.getAll()
        ]);
        setFarms(farmsData);
        setCrops(cropsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        farmId: task.farmId?.toString() || "",
        cropId: task.cropId?.toString() || "",
        title: task.title || "",
        type: task.type || "watering",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        notes: task.notes || ""
      });
    } else {
      setFormData({
        farmId: "",
        cropId: "",
        title: "",
        type: "watering",
        dueDate: "",
        notes: ""
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const getFilteredCrops = () => {
    if (!formData.farmId) return crops;
    return crops.filter(crop => crop.farmId === parseInt(formData.farmId));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = "Farm is required";
    }
    
    if (!formData.title?.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const taskData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      cropId: formData.cropId ? parseInt(formData.cropId) : null,
      completed: false
    };
    
    onSave(taskData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset crop selection when farm changes
    if (field === "farmId") {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        cropId: ""
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? "Edit Task" : "Add New Task"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Select
            label="Farm"
            value={formData.farmId}
            onChange={(e) => handleChange("farmId", e.target.value)}
            error={errors.farmId}
          >
            <option value="">Select a farm</option>
            {farms.map((farm) => (
              <option key={farm.Id} value={farm.Id}>
                {farm.name}
              </option>
            ))}
          </Select>
          
          <Select
            label="Crop (Optional)"
            value={formData.cropId}
            onChange={(e) => handleChange("cropId", e.target.value)}
          >
            <option value="">Select a crop (optional)</option>
            {getFilteredCrops().map((crop) => (
              <option key={crop.Id} value={crop.Id}>
                {crop.cropType} - {crop.fieldLocation}
              </option>
            ))}
          </Select>
          
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            error={errors.title}
            placeholder="e.g., Water tomatoes, Apply fertilizer"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Task Type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="watering">Watering</option>
              <option value="fertilizing">Fertilizing</option>
              <option value="harvesting">Harvesting</option>
              <option value="planting">Planting</option>
              <option value="maintenance">Maintenance</option>
              <option value="pest_control">Pest Control</option>
              <option value="soil_prep">Soil Preparation</option>
            </Select>
            
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              error={errors.dueDate}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes or instructions..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              {task ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;