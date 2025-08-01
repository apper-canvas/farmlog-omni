import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";

const AddCropModal = ({ isOpen, onClose, onSave, crop = null }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    cropType: "",
    plantingDate: "",
    expectedHarvest: "",
    quantity: "",
    unit: "pounds",
    fieldLocation: "",
    growthStage: "planted"
  });

  const [farms, setFarms] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadFarms = async () => {
      try {
        const farmsData = await farmService.getAll();
        setFarms(farmsData);
      } catch (error) {
        console.error("Failed to load farms:", error);
      }
    };

    if (isOpen) {
      loadFarms();
    }
  }, [isOpen]);

  useEffect(() => {
    if (crop) {
      setFormData({
        farmId: crop.farmId?.toString() || "",
        cropType: crop.cropType || "",
        plantingDate: crop.plantingDate ? crop.plantingDate.split("T")[0] : "",
        expectedHarvest: crop.expectedHarvest ? crop.expectedHarvest.split("T")[0] : "",
        quantity: crop.quantity?.toString() || "",
        unit: crop.unit || "pounds",
        fieldLocation: crop.fieldLocation || "",
        growthStage: crop.growthStage || "planted"
      });
    } else {
      setFormData({
        farmId: "",
        cropType: "",
        plantingDate: "",
        expectedHarvest: "",
        quantity: "",
        unit: "pounds",
        fieldLocation: "",
        growthStage: "planted"
      });
    }
    setErrors({});
  }, [crop, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = "Farm is required";
    }
    
    if (!formData.cropType?.trim()) {
      newErrors.cropType = "Crop type is required";
    }
    
    if (!formData.plantingDate) {
      newErrors.plantingDate = "Planting date is required";
    }
    
    if (!formData.expectedHarvest) {
      newErrors.expectedHarvest = "Expected harvest date is required";
    }
    
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be a positive number";
    }
    
    if (!formData.fieldLocation?.trim()) {
      newErrors.fieldLocation = "Field location is required";
    }
    
    if (formData.plantingDate && formData.expectedHarvest) {
      const plantingDate = new Date(formData.plantingDate);
      const harvestDate = new Date(formData.expectedHarvest);
      
      if (harvestDate <= plantingDate) {
        newErrors.expectedHarvest = "Harvest date must be after planting date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const cropData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      quantity: parseFloat(formData.quantity),
      status: "active"
    };
    
    onSave(cropData);
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {crop ? "Edit Crop" : "Add New Crop"}
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
          
          <Input
            label="Crop Type"
            value={formData.cropType}
            onChange={(e) => handleChange("cropType", e.target.value)}
            error={errors.cropType}
            placeholder="e.g., Tomatoes, Corn, Lettuce"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Planting Date"
              type="date"
              value={formData.plantingDate}
              onChange={(e) => handleChange("plantingDate", e.target.value)}
              error={errors.plantingDate}
            />
            
            <Input
              label="Expected Harvest"
              type="date"
              value={formData.expectedHarvest}
              onChange={(e) => handleChange("expectedHarvest", e.target.value)}
              error={errors.expectedHarvest}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantity"
              type="number"
              step="0.1"
              min="0"
              value={formData.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              error={errors.quantity}
              placeholder="0.0"
            />
            
            <Select
              label="Unit"
              value={formData.unit}
              onChange={(e) => handleChange("unit", e.target.value)}
            >
              <option value="pounds">Pounds</option>
              <option value="tons">Tons</option>
              <option value="bushels">Bushels</option>
              <option value="crates">Crates</option>
              <option value="plants">Plants</option>
            </Select>
          </div>
          
          <Input
            label="Field Location"
            value={formData.fieldLocation}
            onChange={(e) => handleChange("fieldLocation", e.target.value)}
            error={errors.fieldLocation}
            placeholder="e.g., North Field, Greenhouse 1"
          />
          
          <Select
            label="Growth Stage"
            value={formData.growthStage}
            onChange={(e) => handleChange("growthStage", e.target.value)}
          >
            <option value="planted">Planted</option>
            <option value="growing">Growing</option>
            <option value="flowering">Flowering</option>
            <option value="ripening">Ripening</option>
            <option value="ready">Ready</option>
          </Select>
          
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
              {crop ? "Update Crop" : "Add Crop"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCropModal;