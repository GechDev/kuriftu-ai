"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Star,
  Clock,
  Users,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Filter,
  Grid,
  List,
  Heart,
  Share2,
  Info,
  Zap,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { resortImages } from "@/lib/resortImages";

// Mock service data - this would come from your API
const mockServices = [
  {
    id: 1,
    name: "Luxury Spa Package",
    category: "Wellness",
    basePrice: 299,
    aiOptimizedPrice: 279,
    aiConfirmed: true,
    rating: 4.8,
    reviews: 234,
    image: resortImages.spa,
    description: "Full day spa experience with massage, facial, and wellness consultation",
    duration: "4 hours",
    capacity: "1-2 people",
    features: ["Deep tissue massage", "Anti-aging facial", "Aromatherapy", "Healthy lunch"],
    discount: 7,
    trending: true,
    popular: true,
  },
  {
    id: 2,
    name: "Romantic Dinner Experience",
    category: "Dining",
    basePrice: 450,
    aiOptimizedPrice: 425,
    aiConfirmed: true,
    rating: 4.9,
    reviews: 189,
    image: resortImages.dining,
    description: "Private beachfront dining with personal chef and sommelier",
    duration: "3 hours",
    capacity: "2 people",
    features: ["Private beach setup", "5-course menu", "Wine pairing", "Live music"],
    discount: 6,
    trending: false,
    popular: true,
  },
  {
    id: 3,
    name: "Adventure Water Sports",
    category: "Activities",
    basePrice: 180,
    aiOptimizedPrice: 165,
    aiConfirmed: false,
    rating: 4.6,
    reviews: 156,
    image: resortImages.tropicalPool,
    description: "Complete water sports package with instructor guidance",
    duration: "3 hours",
    capacity: "1-4 people",
    features: ["Jet skiing", "Parasailing", "Snorkeling", "Equipment included"],
    discount: 8,
    trending: true,
    popular: false,
  },
  {
    id: 4,
    name: "Business Conference Package",
    category: "Business",
    basePrice: 1200,
    aiOptimizedPrice: 1150,
    aiConfirmed: true,
    rating: 4.7,
    reviews: 98,
    image: resortImages.lobby,
    description: "Full-day conference facility with catering and tech support",
    duration: "8 hours",
    capacity: "20-50 people",
    features: ["Conference room", "AV equipment", "Catering", "Tech support"],
    discount: 4,
    trending: false,
    popular: false,
  },
  {
    id: 5,
    name: "Family Fun Day",
    category: "Family",
    basePrice: 320,
    aiOptimizedPrice: 295,
    aiConfirmed: true,
    rating: 4.8,
    reviews: 312,
    image: resortImages.infinityPool,
    description: "All-inclusive family activities with meals and entertainment",
    duration: "6 hours",
    capacity: "2-6 people",
    features: ["Pool access", "Kids club", "Family lunch", "Game room"],
    discount: 8,
    trending: true,
    popular: true,
  },
  {
    id: 6,
    name: "Yoga & Meditation Retreat",
    category: "Wellness",
    basePrice: 150,
    aiOptimizedPrice: 145,
    aiConfirmed: true,
    rating: 4.9,
    reviews: 267,
    image: resortImages.wellnessDetail,
    description: "Morning yoga session with guided meditation and healthy breakfast",
    duration: "2 hours",
    capacity: "10-15 people",
    features: ["Hatha yoga", "Meditation", "Healthy breakfast", "Zen garden access"],
    discount: 3,
    trending: false,
    popular: false,
  },
];

const categories = ["All", "Wellness", "Dining", "Activities", "Business", "Family"];
const sortOptions = ["Featured", "Price: Low to High", "Price: High to Low", "Rating", "Most Popular"];

export default function PricingPage() {
  const [services, setServices] = useState(mockServices);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync with confirmed prices from service optimizer
  useEffect(() => {
    const confirmedPrices = localStorage.getItem('confirmedPrices');
    if (confirmedPrices) {
      const parsed = JSON.parse(confirmedPrices);
      setServices(prev => prev.map(service => 
        parsed[service.id] 
          ? { ...service, aiOptimizedPrice: parsed[service.id], aiConfirmed: true }
          : service
      ));
    }
  }, []);

  const filteredServices = services.filter(service => 
    selectedCategory === "All" || service.category === selectedCategory
  );

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "Price: Low to High":
        return a.aiOptimizedPrice - b.aiOptimizedPrice;
      case "Price: High to Low":
        return b.aiOptimizedPrice - a.aiOptimizedPrice;
      case "Rating":
        return b.rating - a.rating;
      case "Most Popular":
        return b.reviews - a.reviews;
      default:
        return 0;
    }
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
    );
  };

  const openServiceDetail = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleBook = (service: any) => {
    // Handle booking logic here
    console.log('Booking service:', service);
    setIsModalOpen(false);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Premium Resort Services
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Experience luxury with AI-optimized pricing. Our intelligent pricing system ensures you get the best value for every service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge tone="secondary" className="text-sm px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                AI-Optimized Prices
              </Badge>
              <Badge tone="secondary" className="text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Best Price Guarantee
              </Badge>
              <Badge tone="secondary" className="text-sm px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Premium Quality
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  variant={selectedCategory === category ? "primary" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="text-sm px-3 py-1.5"
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "primary" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className="p-2"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "primary" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className="p-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
            : "grid-cols-1"
        }`}>
          {sortedServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card hover className="h-full overflow-hidden group">
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {service.aiConfirmed && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Optimized
                      </span>
                    )}
                    {service.trending && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </span>
                    )}
                    {service.popular && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full inline-flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleFavorite(service.id)}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white p-2"
                    >
                      <Heart 
                        className={`w-4 h-4 ${favorites.includes(service.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      className="bg-white/90 backdrop-blur-sm hover:bg-white p-2"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </Button>
                  </div>

                  {/* Discount Badge */}
                  {service.discount > 0 && (
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-red-500 text-white text-sm px-3 py-1">
                        {service.discount}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-xs text-muted-foreground">({service.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{service.capacity}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} tone="secondary" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                      {service.features.length > 3 && (
                        <Badge className="text-xs border border-border">
                          +{service.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Price Section */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        {service.aiOptimizedPrice < service.basePrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${service.basePrice}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-primary">
                          ${service.aiOptimizedPrice}
                        </span>
                      </div>
                      {service.aiConfirmed && (
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">
                            AI-optimized price
                          </span>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => openServiceDetail(service)}>
                      Book Now
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Pricing Info Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/20 rounded-full">
                <Info className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              AI-Powered Dynamic Pricing
            </h2>
            <p className="text-muted-foreground mb-8">
              Our intelligent pricing system analyzes demand, seasonality, and market trends to provide you with the best possible rates. 
              Prices marked with "AI Optimized" have been carefully calculated to ensure optimal value for both quality and cost.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Market Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time market data and competitor pricing analysis
                </p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Best Price Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  Ensuring you get the best value for your money
                </p>
              </Card>
              <Card className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Instant Updates</h3>
                <p className="text-sm text-muted-foreground">
                  Prices update in real-time based on availability and demand
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={handleBook}
      />
    </div>
  );
}
