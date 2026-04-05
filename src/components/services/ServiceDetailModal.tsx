"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Star,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Sparkles,
  Shield,
  TrendingUp,
  Heart,
  Share2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Service {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  aiOptimizedPrice: number;
  aiConfirmed: boolean;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  duration: string;
  capacity: string;
  features: string[];
  discount: number;
  trending: boolean;
  popular: boolean;
}

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBook: (service: Service) => void;
}

export function ServiceDetailModal({ 
  service, 
  isOpen, 
  onClose, 
  onBook 
}: ServiceDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(1);

  if (!service) return null;

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
              />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {service.aiConfirmed && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full inline-flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Optimized
                  </span>
                )}
                {service.trending && (
                  <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full inline-flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </span>
                )}
                {service.popular && (
                  <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full inline-flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
              </div>

              {/* Discount Badge */}
              {service.discount > 0 && (
                <div className="absolute bottom-4 left-4">
                  <span className="bg-red-500 text-white text-sm px-4 py-2 rounded-full font-semibold">
                    {service.discount}% OFF
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-16rem)]">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {service.name}
                  </h1>
                  <p className="text-muted-foreground mb-4">{service.category}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.rating}</span>
                      <span className="text-muted-foreground">({service.reviews} reviews)</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="p-2">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="p-2">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">About this service</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">What's included</h3>
                    <div className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-xs text-muted-foreground">{service.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Capacity</p>
                        <p className="text-xs text-muted-foreground">{service.capacity}</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Pricing Info */}
                  {service.aiConfirmed && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900 mb-1">AI-Optimized Price</h4>
                          <p className="text-sm text-green-700">
                            This price has been optimized by our AI system based on demand, seasonality, and market trends to provide you with the best value.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Booking */}
                <div>
                  <div className="bg-card border border-border rounded-xl p-6 sticky top-6">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        {service.aiOptimizedPrice < service.basePrice && (
                          <span className="text-lg text-muted-foreground line-through">
                            ${service.basePrice}
                          </span>
                        )}
                        <span className="text-3xl font-bold text-primary">
                          ${service.aiOptimizedPrice}
                        </span>
                      </div>
                      {service.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Save ${service.basePrice - service.aiOptimizedPrice} ({service.discount}% off)
                        </p>
                      )}
                    </div>

                    {/* Booking Form */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Select Date
                        </label>
                        <input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Select Time
                        </label>
                        <select
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">Select a time</option>
                          {timeSlots.map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Number of Guests
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={guests}
                          onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Subtotal</span>
                        <span className="text-sm">${service.aiOptimizedPrice * guests}</span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total</span>
                        <span className="text-primary">${service.aiOptimizedPrice * guests}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <Button
                        className={`w-full ${!selectedDate || !selectedTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => onBook(service)}
                      >
                        Book Now
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full">
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Secure Booking</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          <span>Free Cancellation</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
