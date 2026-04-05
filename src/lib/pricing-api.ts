import type { KuriftuServicePricingRow } from "@/lib/data/types";
import { api } from "@/lib/api";

export type PublicCatalogService = {
  id: string;
  category: string;
  title: string;
  description: string;
  hours: string | null;
  locationNote: string | null;
  howToBook: string | null;
  imageUrl: string | null;
  basePrice: number;
  publishedPrice: number;
};

export async function fetchAdminPricingPreview(
  token: string | null,
): Promise<{ services: KuriftuServicePricingRow[]; updatedAt: number }> {
  if (!token) {
    throw new Error("Sign in as a manager or admin to load live pricing.");
  }
  return api.pricing.adminPreview(token);
}

export async function confirmKuriftuAiPrices(
  token: string | null,
  options?: { serviceIds?: string[]; applyAll?: boolean },
): Promise<{
  success: boolean;
  applied: { id: string; name: string; previousPublished: number; newPublished: number }[];
  message: string;
}> {
  if (!token) {
    throw new Error("Sign in as a manager or admin.");
  }
  const body =
    options?.serviceIds && options.serviceIds.length > 0
      ? { applyAll: false as const, serviceIds: options.serviceIds }
      : { applyAll: options?.applyAll !== false };
  return api.pricing.adminConfirm(token, body);
}

export async function fetchPublicServiceCatalog(slug: string): Promise<{
  resort: { id: string; name: string; slug: string; region: string };
  services: PublicCatalogService[];
}> {
  return api.public.serviceCatalog(slug);
}
