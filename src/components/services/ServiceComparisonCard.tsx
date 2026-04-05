"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Info,
  Sparkles,
  DollarSign,
  BarChart3,
  Clock,
  Users,
  Target,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface ServiceComparisonCardProps {
  service: {
    id: number;
    name: string;
    category: string;
    basePrice: number;
    publishedPrice: number;
    aiSuggestedPrice: number;
    confidence: number;
    demandLevel: string;
    status: string;
    insight: string;
    image?: string;
  };
  onConfirmAiPrice: (serviceId: number, newPrice: number) => void;
  isConfirmed?: boolean;
}

export function ServiceComparisonCard({
  service,
  onConfirmAiPrice,
  isConfirmed = false,
}: ServiceComparisonCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const priceDifference = service.aiSuggestedPrice - service.publishedPrice;
  const priceChangePercent = ((priceDifference / service.publishedPrice) * 100).toFixed(1);
  const isPriceIncrease = priceDifference > 0;

  // Debug logging
  console.log('ServiceComparisonCard - service:', {
    name: service.name,
    publishedPrice: service.publishedPrice,
    aiSuggestedPrice: service.aiSuggestedPrice,
    priceDifference,
    priceChangePercent
  });

  const handleConfirmPrice = async () => {
    setIsConfirming(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onConfirmAiPrice(service.id, service.aiSuggestedPrice);
    setIsConfirming(false);
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case "Surge": return "text-red-600 bg-red-50";
      case "High": return "text-orange-600 bg-orange-50";
      case "Medium": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Optimal": return "text-green-600 bg-green-50";
      case "Underpriced": return "text-amber-600 bg-amber-50";
      default: return "text-red-600 bg-red-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className={`overflow-hidden ${isConfirmed ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
        {/* Header */}
        <div className="relative h-32 overflow-hidden">
          {service.image && (
            <Image
              src={service.image}
              alt={service.name}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`px-3 py-1 ${getDemandColor(service.demandLevel)}`}>
              {service.demandLevel} Demand
            </Badge>
          </div>

          {isConfirmed && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-green-500 text-white px-3 py-1">
                <CheckCircle className="w-3 h-3 mr-1" />
                AI Price Confirmed
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Service Info */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground mb-1">{service.name}</h3>
            <p className="text-sm text-muted-foreground">{service.category}</p>
          </div>

          {/* Price Comparison */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Current Price */}
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-700">${service.publishedPrice}</p>
            </div>

            {/* AI Suggested */}
            <div className="text-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-center mb-1">
                <Sparkles className="w-4 h-4 text-blue-600 mr-1" />
                <p className="text-xs text-blue-600">AI Suggested</p>
              </div>
              <p className="text-lg font-bold text-blue-700">${service.aiSuggestedPrice}</p>
              <p className="text-xs text-blue-600">({service.confidence}% confidence)</p>
            </div>

            {/* Price Change */}
            <div className={`text-center p-3 rounded-lg ${isPriceIncrease ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center justify-center mb-1">
                {isPriceIncrease ? (
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                )}
                <p className={`text-xs ${isPriceIncrease ? 'text-green-600' : 'text-red-600'}`}>
                  {isPriceIncrease ? 'Increase' : 'Decrease'}
                </p>
              </div>
              <p className={`text-lg font-bold ${isPriceIncrease ? 'text-green-700' : 'text-red-700'}`}>
                {isPriceIncrease ? '+' : ''}{priceChangePercent}%
              </p>
              <p className={`text-xs ${isPriceIncrease ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(priceDifference)}
              </p>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="space-y-3 mb-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <Badge className={`px-3 py-1 ${getStatusColor(service.status)}`}>
                {service.status}
              </Badge>
            </div>

            {/* Insight */}
            <div className="bg-secondary/5 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium mb-1">AI Insight</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {service.insight}
                  </p>
                </div>
              </div>
            </div>

            {/* Market Factors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Demand Level</p>
                  <p className="text-sm font-medium">{service.demandLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-sm font-medium">{service.confidence}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1"
            >
              {isExpanded ? 'Hide' : 'Show'} Details
            </Button>
            
            {!isConfirmed && (
              <Button
                onClick={handleConfirmPrice}
                className={`flex-1 ${isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isConfirming ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm AI Price
                  </>
                )}
              </Button>
            )}

            {isConfirmed && (
              <Button
                variant="secondary"
                className={`flex-1 ${true ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Shield className="w-4 h-4 mr-2" />
                Price Confirmed
              </Button>
            )}
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-3">Price Analysis</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">${service.basePrice}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Current Margin</span>
                      <span className="font-medium">
                        {((service.publishedPrice - service.basePrice) / service.basePrice * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">AI Margin</span>
                      <span className="font-medium">
                        {((service.aiSuggestedPrice - service.basePrice) / service.basePrice * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-3">Market Context</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Competitor Avg</span>
                      <span className="font-medium">
                        ${(service.aiSuggestedPrice * 0.95).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Market Position</span>
                      <span className="font-medium">
                        {service.publishedPrice > service.aiSuggestedPrice ? 'Premium' : 'Competitive'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Optimization Score</span>
                      <span className="font-medium">
                        {service.status === 'Optimal' ? '95/100' : '72/100'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Impact */}
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">Revenue Impact</h4>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>• Daily revenue change: 
                    <span className={`font-medium ${isPriceIncrease ? 'text-green-600' : 'text-red-600'}`}>
                      {isPriceIncrease ? '+' : ''}${(priceDifference * 5).toFixed(0)}
                    </span>
                    </p>
                  <p>• Monthly impact: 
                    <span className={`font-medium ${isPriceIncrease ? 'text-green-600' : 'text-red-600'}`}>
                      {isPriceIncrease ? '+' : ''}${(priceDifference * 150).toFixed(0)}
                    </span>
                    </p>
                  <p>• Based on average 5 daily bookings</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
