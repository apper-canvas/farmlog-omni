import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import CropCard from "@/components/molecules/CropCard";
import AddCropModal from "@/components/organisms/AddCropModal";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import cropService from "@/services/api/cropService";
import farmService from "@/services/api/farmService";
import transactionService from "@/services/api/transactionService";
import { toast } from "react-toastify";

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [filterFarm, setFilterFarm] = useState("");
  const [filterStage, setFilterStage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      
      setCrops(cropsData);
      setFarms(farmsData);
    } catch (err) {
      setError("Failed to load crops data");
      console.error("Crops data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCrop = async (cropData) => {
    try {
      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.Id, cropData);
        setCrops(prev => prev.map(crop => 
          crop.Id === editingCrop.Id ? updatedCrop : crop
        ));
        toast.success("Crop updated successfully!");
      } else {
        const newCrop = await cropService.create(cropData);
        setCrops(prev => [...prev, newCrop]);
        toast.success("Crop added successfully!");
      }
      
      setEditingCrop(null);
    } catch (error) {
      toast.error("Failed to save crop");
      console.error("Crop save error:", error);
    }
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setIsModalOpen(true);
  };

  const handleHarvestCrop = async (crop) => {
    try {
      // Update crop status to harvested
      const updatedCrop = {
        ...crop,
        status: "harvested",
        growthStage: "harvested"
      };
      
      await cropService.update(crop.Id, updatedCrop);
      
      // Create income transaction for harvest
      const harvestIncome = {
        farmId: crop.farmId,
        type: "income",
        category: "crop_sales",
        amount: Math.round(crop.quantity * (Math.random() * 5 + 3)), // Random price per unit
        date: new Date().toISOString(),
        description: `Harvest sale - ${crop.cropType} (${crop.quantity} ${crop.unit})`,
        paymentMethod: "cash"
      };
      
      await transactionService.create(harvestIncome);
      
      setCrops(prev => prev.map(c => 
        c.Id === crop.Id ? updatedCrop : c
      ));
      
      toast.success(`Successfully harvested ${crop.cropType}! Income recorded.`);
    } catch (error) {
      toast.error("Failed to record harvest");
      console.error("Harvest error:", error);
    }
  };

  const handleAddCrop = () => {
    setEditingCrop(null);
    setIsModalOpen(true);
  };

  // Filter crops
  const filteredCrops = crops.filter(crop => {
    const farmMatch = !filterFarm || crop.farmId === parseInt(filterFarm);
    const stageMatch = !filterStage || crop.growthStage === filterStage;
    const activeMatch = crop.status === "active"; // Only show active crops
    
    return farmMatch && stageMatch && activeMatch;
  });

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : "Unknown Farm";
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Crop Management" 
        subtitle="Track your crops from planting to harvest"
      >
        <Button onClick={handleAddCrop}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Crop
        </Button>
      </Header>

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
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="text-sm"
            >
              <option value="">All Growth Stages</option>
              <option value="planted">Planted</option>
              <option value="growing">Growing</option>
              <option value="flowering">Flowering</option>
              <option value="ripening">Ripening</option>
              <option value="ready">Ready</option>
            </Select>
          </div>
          
          {(filterFarm || filterStage) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterFarm("");
                setFilterStage("");
              }}
            >
              <ApperIcon name="X" size={14} className="mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {filteredCrops.length === 0 ? (
        <Empty
          title={crops.length === 0 ? "No crops yet" : "No crops match your filters"}
          description={crops.length === 0 
            ? "Start by planting your first crop to track its growth and harvest" 
            : "Try adjusting your filters to see more crops"
          }
          icon="Sprout"
          actionLabel={crops.length === 0 ? "Plant Your First Crop" : "Add New Crop"}
          onAction={handleAddCrop}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredCrops.length} crop{filteredCrops.length !== 1 ? 's' : ''}
              {filterFarm && ` from ${getFarmName(parseInt(filterFarm))}`}
              {filterStage && ` in ${filterStage} stage`}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <CropCard
                key={crop.Id}
                crop={crop}
                onEdit={handleEditCrop}
                onHarvest={handleHarvestCrop}
              />
            ))}
          </div>
        </>
      )}

      <AddCropModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCrop(null);
        }}
        onSave={handleSaveCrop}
        crop={editingCrop}
      />
    </div>
  );
};

export default Crops;