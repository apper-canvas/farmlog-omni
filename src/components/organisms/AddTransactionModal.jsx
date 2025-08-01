import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";

const AddTransactionModal = ({ isOpen, onClose, onSave, transaction = null }) => {
  const [formData, setFormData] = useState({
    farmId: "",
    type: "expense",
    category: "",
    amount: "",
    date: "",
    description: "",
    paymentMethod: "cash"
  });

  const [farms, setFarms] = useState([]);
  const [errors, setErrors] = useState({});

  const expenseCategories = [
    "seeds", "fertilizer", "equipment", "labor", "fuel", 
    "maintenance", "irrigation", "pest_control", "other"
  ];

  const incomeCategories = [
    "crop_sales", "livestock_sales", "equipment_rental", 
    "consulting", "government_subsidy", "other"
  ];

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
    if (transaction) {
      setFormData({
        farmId: transaction.farmId?.toString() || "",
        type: transaction.type || "expense",
        category: transaction.category || "",
        amount: transaction.amount?.toString() || "",
        date: transaction.date ? transaction.date.split("T")[0] : "",
        description: transaction.description || "",
        paymentMethod: transaction.paymentMethod || "cash"
      });
    } else {
      setFormData({
        farmId: "",
        type: "expense",
        category: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        paymentMethod: "cash"
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = "Farm is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number";
    }
    
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const transactionData = {
      ...formData,
      farmId: parseInt(formData.farmId),
      amount: parseFloat(formData.amount)
    };
    
    onSave(transactionData);
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset category when type changes
    if (field === "type") {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        category: ""
      }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const getCurrentCategories = () => {
    return formData.type === "expense" ? expenseCategories : incomeCategories;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? "Edit Transaction" : "Add New Transaction"}
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
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
            
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              error={errors.category}
            >
              <option value="">Select category</option>
              {getCurrentCategories().map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount ($)"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              error={errors.amount}
              placeholder="0.00"
            />
            
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              error={errors.date}
            />
          </div>
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            error={errors.description}
            placeholder="Brief description of the transaction"
          />
          
          <Select
            label="Payment Method"
            value={formData.paymentMethod}
            onChange={(e) => handleChange("paymentMethod", e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="check">Check</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
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
              {transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;