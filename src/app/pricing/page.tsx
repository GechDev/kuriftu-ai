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
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] via-white to-primary/[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--accent)_0%,_transparent_50%)] opacity-20" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 mb-6 text-[10px] font-medium text-accent backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Premium Experiences
            </div>
            
            <h1 className="font-display text-5xl font-light tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Resort Services
              <span className="block text-2xl font-light text-muted sm:text-3xl lg:text-4xl">
                & Experiences
              </span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted/90 sm:text-xl">
              Discover our curated collection of luxury experiences, from signature spa treatments 
              to exclusive dining. Each service is thoughtfully designed and priced 
              using our intelligent optimization system.
            </p>
            
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm text-muted backdrop-blur-sm border border-border/20 shadow-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Live pricing
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm text-muted backdrop-blur-sm border border-border/20 shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                On-property
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-2 text-sm text-muted backdrop-blur-sm border border-border/20 shadow-sm">
                <Star className="h-3.5 w-3.5" />
                AI optimized
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-0 z-40 border-b border-border/10 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "ghost"}
                onClick={() => setSelectedCategory(category)}
                className={`!rounded-full !px-4 !py-2 !text-xs font-medium transition-all duration-200 ${
                  selectedCategory === category 
                    ? "shadow-lg shadow-accent/25 ring-2 ring-accent/20" 
                    : "hover:bg-accent/5 border border-border/20"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-white border border-border/20 px-4 py-2 text-xs font-medium text-foreground hover:bg-accent/5 hover:border-accent/30 disabled:opacity-50 transition-all duration-200 shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-border/20 bg-white/80 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent/40 transition-all duration-200"
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Name">Name</option>
            </select>
            
            <div className="flex items-center rounded-full bg-white/80 border border-border/20 p-0.5 backdrop-blur-sm">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="!p-2 !rounded-full"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                onClick={() => setViewMode("list")}
                className="!p-2 !rounded-full"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading && services.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted">
            <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
            <p className="text-sm">Loading services…</p>
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error} Start the API on port 4000 and run{" "}
            <code className="rounded bg-white px-1">npm run db:seed</code> in{" "}
            <code className="rounded bg-white px-1">kuriftu-ai/backend</code>.
          </div>
        ) : null}

        <div
          className={`grid gap-8 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          }`}
        >
          {sortedServices.map((service, index) => {
            const img = service.imageUrl ?? resortImages.spa;
            const showStrike = service.basePrice > service.publishedPrice + 0.01;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group"
              >
                <Card className="h-full overflow-hidden border-0 bg-white shadow-lg shadow-black/[0.04] hover:shadow-2xl hover:shadow-black/[0.08] transition-all duration-300">
                  <div className="relative h-56 w-full overflow-hidden">
                    <SafeImage
                      src={img}
                      alt={service.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute left-4 top-4">
                      <div className="rounded-full bg-white/95 px-3 py-1.5 backdrop-blur-sm border border-white/20 shadow-lg">
                        <span className="text-[10px] font-medium uppercase tracking-wide text-foreground">
                          {categoryLabel(service.category)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="absolute right-4 top-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(service.id)}
                        className="rounded-full bg-white/95 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white"
                        aria-label={favorites.includes(service.id) ? "Remove favorite" : "Add favorite"}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors duration-200 ${
                            favorites.includes(service.id) ? "fill-red-500 text-red-500" : "text-muted/70"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-white/95 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-white"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4 text-muted/70" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl font-light tracking-tight text-foreground line-clamp-1">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted/80 line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1.5 border border-amber-100">
                        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-semibold text-amber-700">4.8</span>
                      </div>
                    </div>
                    
                    {service.hours && (
                      <div className="flex items-center gap-2 text-sm text-muted/70">
                        <Clock className="h-4 w-4" />
                        <span>{service.hours}</span>
                      </div>
                    )}
                    
                    <div className="flex items-end justify-between pt-4 border-t border-border/10">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3">
                          {showStrike && (
                            <span className="text-sm text-muted/60 line-through">
                              ${service.basePrice.toFixed(0)}
                            </span>
                          )}
                          <div className="flex items-baseline gap-1">
                            <span className="text-[10px] font-medium uppercase tracking-wide text-muted/70">$</span>
                            <span className="font-display text-3xl font-light text-foreground">
                              {service.publishedPrice.toFixed(0)}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-accent">
                          <Sparkles className="h-3 w-3" />
                          AI optimized rate
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSelectedService(buildModalService(service));
                          setIsModalOpen(true);
                        }}
                        className="rounded-xl bg-gradient-to-r from-accent to-accent/90 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-accent/25 hover:from-accent/95 hover:shadow-accent/35 transition-all duration-200"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
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
