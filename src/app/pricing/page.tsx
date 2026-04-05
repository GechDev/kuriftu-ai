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
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/5">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/[0.07] via-white to-secondary/10">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
              {resortName}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Resort services & experiences
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Live pricing from our reservation system. Rates reflect staff-confirmed published prices
             —including updates after AI review in the service optimizer.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Badge tone="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Database-backed rates
              </Badge>
              <Badge tone="secondary" className="gap-1.5 px-3 py-1.5 text-xs">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                On-property offerings
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="!rounded-full !px-3 !py-1.5 !text-xs"
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
              Refresh
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-border bg-white px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-accent/25"
            >
              <option value="Featured">Featured</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Name">Name</option>
            </select>
            <div className="flex gap-1 rounded-full border border-border p-0.5">
              <Button
                variant={viewMode === "grid" ? "primary" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="!p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                onClick={() => setViewMode("list")}
                className="!p-2"
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
          className={`grid gap-6 ${
            viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {sortedServices.map((service, index) => {
            const img = service.imageUrl ?? resortImages.spa;
            const showStrike = service.basePrice > service.publishedPrice + 0.01;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.03 }}
              >
                <Card hover className="h-full overflow-hidden border-border">
                  <div className="relative h-48 w-full overflow-hidden">
                    <SafeImage
                      src={img}
                      alt={service.title}
                      fill
                      sizes="(max-width:768px) 100vw, 33vw"
                      className="object-cover transition duration-500 hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute left-3 top-3">
                      <Badge tone="secondary" className="text-[10px] uppercase tracking-wide">
                        {categoryLabel(service.category)}
                      </Badge>
                    </div>
                    <div className="absolute right-3 top-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(service.id)}
                        className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur"
                        aria-label={favorites.includes(service.id) ? "Remove favorite" : "Add favorite"}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.includes(service.id) ? "fill-red-500 text-red-500" : "text-muted"
                          }`}
                        />
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-white/90 p-2 shadow-sm backdrop-blur"
                        aria-label="Share"
                      >
                        <Share2 className="h-4 w-4 text-muted" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-semibold text-foreground">{service.title}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">{service.description}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5 text-amber-600">
                        <Star className="h-4 w-4 fill-current" aria-hidden />
                        <span className="text-sm font-semibold">4.8</span>
                      </div>
                    </div>
                    {service.hours ? (
                      <p className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="h-3.5 w-3.5" aria-hidden />
                        {service.hours}
                      </p>
                    ) : null}
                    <div className="flex items-end justify-between border-t border-border pt-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          {showStrike ? (
                            <span className="text-sm text-muted line-through">
                              ${service.basePrice.toFixed(0)}
                            </span>
                          ) : null}
                          <span className="font-display text-2xl font-semibold text-foreground">
                            ${service.publishedPrice.toFixed(0)}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-secondary">
                          <Sparkles className="h-3 w-3" aria-hidden />
                          Current guest rate
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        className="!rounded-full !px-4 !py-2 !text-xs"
                        onClick={() => {
                          setSelectedService(buildModalService(service));
                          setIsModalOpen(true);
                        }}
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

      <ServiceDetailModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBook={() => setIsModalOpen(false)}
      />
    </div>
  );
}
