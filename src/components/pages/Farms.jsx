import React, { useState, useEffect } from "react";
import Header from "@/components/organisms/Header";
import FarmCard from "@/components/molecules/FarmCard";
import AddFarmModal from "@/components/organisms/AddFarmModal";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import { toast } from "react-toastify";

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [farmsData, cropsData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError("Failed to load farms data");
      console.error("Farms data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveFarm = async (farmData) => {
    try {
      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.Id, farmData);
        setFarms(prev => prev.map(farm => 
          farm.Id === editingFarm.Id ? updatedFarm : farm
        ));
        toast.success("Farm updated successfully!");
      } else {
        const newFarm = await farmService.create(farmData);
        setFarms(prev => [...prev, newFarm]);
        toast.success("Farm added successfully!");
      }
      
      setEditingFarm(null);
    } catch (error) {
      toast.error("Failed to save farm");
      console.error("Farm save error:", error);
    }
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setIsModalOpen(true);
  };

  const handleViewFarm = (farm) => {
    // In a real app, this would navigate to a detailed farm view
    toast.info(`Viewing details for ${farm.name}`);
  };

  const handleAddFarm = () => {
    setEditingFarm(null);
    setIsModalOpen(true);
  };

  const getActiveCropsForFarm = (farmId) => {
    return crops.filter(crop => crop.farmId === farmId && crop.status === "active").length;
  };

  if (loading) return <Loading type="cards" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Farm Management" 
        subtitle="Manage your farms and their operations"
      >
        <Button onClick={handleAddFarm}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Farm
        </Button>
      </Header>

      {farms.length === 0 ? (
        <Empty
          title="No farms yet"
          description="Start by adding your first farm to begin tracking your agricultural operations"
          icon="Wheat"
          actionLabel="Add Your First Farm"
          onAction={handleAddFarm}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard
              key={farm.Id}
              farm={farm}
              activeCrops={getActiveCropsForFarm(farm.Id)}
              onEdit={handleEditFarm}
              onView={handleViewFarm}
            />
          ))}
        </div>
      )}

      <AddFarmModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFarm(null);
        }}
        onSave={handleSaveFarm}
        farm={editingFarm}
      />
    </div>
  );
};

export default Farms;