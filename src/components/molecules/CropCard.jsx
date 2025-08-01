import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const CropCard = ({ crop, onEdit, onHarvest }) => {
  const getDaysToHarvest = () => {
    const today = new Date();
    const harvestDate = new Date(crop.expectedHarvest);
    const days = differenceInDays(harvestDate, today);
    
    if (days < 0) return { text: "Ready to harvest", variant: "success" };
    if (days === 0) return { text: "Harvest today", variant: "warning" };
    if (days <= 7) return { text: `${days} days left`, variant: "warning" };
    return { text: `${days} days left`, variant: "info" };
  };

  const getGrowthStageVariant = (stage) => {
    switch (stage) {
      case "planted": return "info";
      case "growing": return "primary";
      case "flowering": return "warning";
      case "ripening": return "warning";
      case "ready": return "success";
      default: return "default";
    }
  };

  const getCropIcon = (cropType) => {
    const type = cropType?.toLowerCase() || "";
    if (type.includes("corn")) return "Wheat";
    if (type.includes("tomato")) return "Apple";
    if (type.includes("lettuce") || type.includes("spinach")) return "Leaf";
    if (type.includes("carrot")) return "Carrot";
    if (type.includes("potato")) return "Circle";
    return "Sprout";
  };

  const harvestInfo = getDaysToHarvest();
  const isReadyToHarvest = crop.growthStage === "ready" || harvestInfo.text === "Ready to harvest";

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{crop.cropType}</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <ApperIcon 
              name={getCropIcon(crop.cropType)} 
              size={24} 
              className="text-primary-600" 
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Growth Stage:</span>
            <Badge variant={getGrowthStageVariant(crop.growthStage)}>
              {crop.growthStage}
            </Badge>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Calendar" size={14} className="mr-2" />
            Planted: {format(new Date(crop.plantingDate), "MMM dd, yyyy")}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="MapPin" size={14} className="mr-2" />
            {crop.fieldLocation}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Package" size={14} className="mr-2" />
            {crop.quantity} {crop.unit}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Harvest:</span>
              <Badge variant={harvestInfo.variant}>
                {harvestInfo.text}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Expected: {format(new Date(crop.expectedHarvest), "MMM dd, yyyy")}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {isReadyToHarvest && (
            <Button 
              size="sm" 
              variant="success"
              onClick={() => onHarvest(crop)}
              className="flex-1"
            >
              <ApperIcon name="Scissors" size={14} className="mr-1" />
              Harvest
            </Button>
          )}
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onEdit(crop)}
            className={isReadyToHarvest ? "px-3" : "flex-1"}
          >
            <ApperIcon name="Edit" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropCard;