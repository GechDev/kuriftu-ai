"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SafeImage } from "@/components/ui/SafeImage";
import {
  Star,
  Clock,
  Sparkles,
  Grid,
  List,
  Heart,
  Share2,
  Loader2,
  RefreshCw,
  MapPin,
  CheckCircle,
  Wifi,
  Coffee,
  Bath,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ServiceDetailModal } from "@/components/services/ServiceDetailModal";
import { fetchPublicServiceCatalog, type PublicCatalogService } from "@/lib/pricing-api";
import { resortImages } from "@/lib/resortImages";

const RESORT_SLUG = "kuriftu-lakeside";

function categoryLabel(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, " ");
}

function getCategoryIcon(category: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    spa: <Sparkles className="h-4 w-4" />,
    dining: <Utensils className="h-4 w-4" />,
    wellness: <Bath className="h-4 w-4" />,
    activities: <Coffee className="h-4 w-4" />,
  };
  return icons[category.toLowerCase()] || <Wifi className="h-4 w-4" />;
}

function buildModalService(s: PublicCatalogService) {
  const img = s.imageUrl ?? resortImages.spa;
  return {
    id: s.id,
    name: s.title,
    category: categoryLabel(s.category),
    basePrice: s.basePrice,
    aiOptimizedPrice: s.publishedPrice,
    aiConfirmed: true,
    rating: 4.8,
    reviews: 120,
    image: img,
    description: s.description,
    duration: s.hours ?? "See concierge",
    capacity: "Guests",
    features: [s.locationNote, s.howToBook].filter(Boolean) as string[],
    discount:
      s.basePrice > s.publishedPrice
        ? Math.round(((s.basePrice - s.publishedPrice) / s.basePrice) * 100)
        : 0,
    trending: false,
    popular: s.publishedPrice > 150,
  };
}

export default function PricingPage() {
  const [services, setServices] = useState<PublicCatalogService[]>([]);
  const [resortName, setResortName] = useState("Kuriftu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedService, setSelectedService] = useState<ReturnType<typeof buildModalService> | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { resort, services: list } = await fetchPublicServiceCatalog(RESORT_SLUG);
      setResortName(resort.name);
      setServices(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load catalog");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(() => {
    const u = new Set(services.map((s) => categoryLabel(s.category)));
    return ["All", ...Array.from(u).sort()];
  }, [services]);

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      if (selectedCategory === "All") return true;
      return categoryLabel(s.category) === selectedCategory;
    });
  }, [services, selectedCategory]);

  const sortedServices = useMemo(() => {
    const copy = [...filteredServices];
    switch (sortBy) {
      case "Price: Low to High":
        return copy.sort((a, b) => a.publishedPrice - b.publishedPrice);
      case "Price: High to Low":
        return copy.sort((a, b) => b.publishedPrice - a.publishedPrice);
      case "Name":
        return copy.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return copy;
    }
  }, [filteredServices, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a1210] to-[#0a1210]">
      {/* Hero Section - Cinematic with dark overlay */}
      <section className="relative min-h-[40vh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${resortImages.hero})` }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_20%,rgba(212,175,55,0.08),transparent_60%)]" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[40vh] flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 backdrop-blur-sm px-3 py-1.5 mb-3 text-[10px] font-medium text-gold-400">
              <Sparkles className="h-3 w-3" />
              Premium Experiences
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Resort Services
              <span className="block text-xl font-light text-white/80 sm:text-2xl lg:text-3xl mt-2">
                & Experiences
              </span>
            </h1>
            
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              Discover our curated collection of luxury experiences, from signature spa treatments 
              to exclusive dining. Each service is thoughtfully designed and priced 
              using our intelligent optimization system.
            </p>
            
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                Live pricing
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
                <MapPin className="h-3.5 w-3.5" />
                On-property
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white">
                <Star className="h-3.5 w-3.5" />
                AI optimized
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? "bg-gold-400/20 text-gold-400 ring-1 ring-gold-400/50"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all duration-200"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 focus:outline-none focus:ring-1 focus:ring-gold-400/50 cursor-pointer"
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Name">Name</option>
            </select>
            
            <div className="flex items-center rounded-full border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewMode === "grid" ? "bg-gold-400/20 text-gold-400" : "text-white/50 hover:text-white"
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full transition-all duration-200 ${
                  viewMode === "list" ? "bg-gold-400/20 text-gold-400" : "text-white/50 hover:text-white"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {loading && services.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gold-400" />
            <p className="text-sm text-white/60">Loading services…</p>
          </div>
        ) : null}

        {error && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
            {error} Start the API on port 4000 and run{" "}
            <code className="rounded bg-black/30 px-1">npm run db:seed</code> in{" "}
            <code className="rounded bg-black/30 px-1">kuriftu-ai/backend</code>.
          </div>
        )}

        {!loading && !error && sortedServices.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/60">No services found in this category.</p>
          </div>
        )}

        <div
          className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}
        >
          {sortedServices.map((service, index) => {
            const img = service.imageUrl ?? resortImages.spa;
            const showStrike = service.basePrice > service.publishedPrice + 0.01;
            const discount = showStrike
              ? Math.round(((service.basePrice - service.publishedPrice) / service.basePrice) * 100)
              : 0;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-gold-400/5">
                  {/* Image Section */}
                  <div className="relative h-56 w-full overflow-hidden">
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <SafeImage
                        src={img}
                        alt={service.title}
                        fill
                        sizes="(max-width:768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </motion.div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    <div className="absolute left-3 top-3">
                      <div className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 border border-white/10">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-gold-400">
                          {categoryLabel(service.category)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Discount Badge */}
                    {discount > 0 && (
                      <div className="absolute left-3 bottom-3">
                        <div className="rounded-full bg-gold-400/20 backdrop-blur-md px-2 py-0.5 border border-gold-400/30">
                          <span className="text-[10px] font-bold text-gold-400">-{discount}%</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute right-3 top-3 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(service.id)}
                        className="rounded-full bg-black/60 backdrop-blur-md p-2 transition-all duration-200 hover:scale-110 hover:bg-gold-400/20"
                        aria-label={favorites.includes(service.id) ? "Remove favorite" : "Add favorite"}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 transition-colors duration-200 ${
                            favorites.includes(service.id) ? "fill-gold-400 text-gold-400" : "text-white/60"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-black/60 backdrop-blur-md p-2 transition-all duration-200 hover:scale-110 hover:bg-gold-400/20"
                        aria-label="Share"
                      >
                        <Share2 className="h-3.5 w-3.5 text-white/60" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg tracking-tight text-white line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-white line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-gold-400/10 px-2 py-1 border border-gold-400/20 shrink-0">
                        <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                        <span className="text-xs font-semibold text-gold-400">4.8</span>
                      </div>
                    </div>
                    
                    {service.hours && (
                      <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Clock className="h-3 w-3" />
                        <span>{service.hours}</span>
                      </div>
                    )}
                    
                    <div className="flex items-end justify-between pt-3 border-t border-white/10">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          {showStrike && (
                            <span className="text-xs text-white/40 line-through">
                              ${service.basePrice.toFixed(0)}
                            </span>
                          )}
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-xs font-medium text-white/50">$</span>
                            <span className="text-2xl font-bold text-gold-400">
                              {service.publishedPrice.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Sparkles className="h-2.5 w-2.5 text-gold-400/70" />
                          <p className="text-[10px] font-medium text-white/50">AI optimized rate</p>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedService(buildModalService(service));
                          setIsModalOpen(true);
                        }}
                        className="rounded-full bg-gold-400/20 px-4 py-1.5 text-xs font-semibold text-gold-200 hover:bg-gold-400/40 hover:text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer border border-gold-400/30 transition-all duration-300"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* AI Optimization Note */}
      <section className="border-t border-white/10 bg-black/40 py-8 mt-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 text-sm text-white/50">
            <CheckCircle className="h-4 w-4 text-gold-400" />
            <span>All prices are AI-optimized and updated in real-time based on demand</span>
          </div>
        </div>
      </section>

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={() => setIsModalOpen(false)}
      />
    </div>
  );
}