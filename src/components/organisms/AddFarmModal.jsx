import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const AddFarmModal = ({ isOpen, onClose, onSave, farm = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    sizeUnit: "acres",
    location: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (farm) {
      setFormData({
        name: farm.name || "",
        size: farm.size?.toString() || "",
        sizeUnit: farm.sizeUnit || "acres",
        location: farm.location || ""
      });
    } else {
      setFormData({
        name: "",
        size: "",
        sizeUnit: "acres",
        location: ""
      });
    }
    setErrors({});
  }, [farm, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = "Farm name is required";
    }
    
    if (!formData.size || parseFloat(formData.size) <= 0) {
      newErrors.size = "Size must be a positive number";
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const farmData = {
      ...formData,
      size: parseFloat(formData.size)
    };
    
    onSave(farmData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {farm ? "Edit Farm" : "Add New Farm"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Farm Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            placeholder="Enter farm name"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Size"
              type="number"
              step="0.1"
              min="0"
              value={formData.size}
              onChange={(e) => handleChange("size", e.target.value)}
              error={errors.size}
              placeholder="0.0"
            />
            
            <Select
              label="Unit"
              value={formData.sizeUnit}
              onChange={(e) => handleChange("sizeUnit", e.target.value)}
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="sq ft">Square Feet</option>
              <option value="sq m">Square Meters</option>
            </Select>
          </div>
          
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            error={errors.location}
            placeholder="Enter farm location"
          />
          
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
              {farm ? "Update Farm" : "Add Farm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFarmModal;