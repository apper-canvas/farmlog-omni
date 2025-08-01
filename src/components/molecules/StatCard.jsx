import React from "react";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ title, value, icon, trend, trendValue, className, valueColor = "text-gray-900" }) => {
  const getTrendColor = () => {
    if (trend === "up") return "text-success";
    if (trend === "down") return "text-error";
    return "text-gray-500";
  };

  const getTrendIcon = () => {
    if (trend === "up") return "TrendingUp";
    if (trend === "down") return "TrendingDown";
    return "Minus";
  };

  return (
    <Card className={cn("hover:scale-102 transition-transform duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className={cn("text-2xl font-bold", valueColor)}>{value}</p>
            {trend && trendValue && (
              <div className={cn("flex items-center mt-1", getTrendColor())}>
                <ApperIcon name={getTrendIcon()} size={16} className="mr-1" />
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
            <ApperIcon name={icon} size={24} className="text-primary-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;