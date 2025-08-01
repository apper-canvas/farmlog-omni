import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const FarmCard = ({ farm, activeCrops, onEdit, onView }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{farm.name}</CardTitle>
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Wheat" size={24} className="text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="MapPin" size={14} className="mr-2" />
            {farm.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Maximize" size={14} className="mr-2" />
            {farm.size} {farm.sizeUnit}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ApperIcon name="Sprout" size={14} className="mr-2" />
            {activeCrops} active crops
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => onView(farm)}
            className="flex-1"
          >
            <ApperIcon name="Eye" size={14} className="mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onEdit(farm)}
            className="px-3"
          >
            <ApperIcon name="Edit" size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmCard;