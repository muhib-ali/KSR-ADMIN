import { Injectable, Logger } from "@nestjs/common";
import { Product } from "../entities/product.entity";
import { ChatbotProductPayload } from "./chatbot-training.payload";

@Injectable()
export class ChatbotTrainingClientService {
  private readonly logger = new Logger(ChatbotTrainingClientService.name);
  private readonly baseUrl: string;

  constructor() {
    const url = process.env.CHATBOT_TRAINING_API_URL || "http://localhost:5001";
    this.baseUrl = (url || "").trim();
  }

  private static readonly DEFAULT_VARIANT_TYPES = ["size", "model", "year"];

  /**
   * Build payload for the Chatbot Training API from a Product entity.
   * Derives category_name, brand_name, supplier_name, warehouse_name from relations.
   * Excludes stock_quantity. Includes variants, custom_variants, bulk_pricing, discount dates, total_cost, price_after_discount.
   */
  toPayload(product: Product): ChatbotProductPayload {
    const category = product.category as { name?: string } | undefined;
    const brand = product.brand as { name?: string } | undefined;
    const supplier = product.supplier as { supplier_name?: string } | undefined;
    const warehouse = product.warehouse as { name?: string } | undefined;
    const tax = product.tax as { title?: string } | undefined;
    const variantsList = (product.variants || []) as Array<{
      value: string;
      variantType?: { name?: string };
    }>;
    const variantItems = variantsList
      .map((v) => ({
        type_name: (v.variantType?.name ?? "").trim() || "unknown",
        value: (v.value ?? "").trim(),
      }))
      .filter((v) => v.type_name && v.value);
    const customVariantItems = variantItems.filter(
      (v) =>
        !ChatbotTrainingClientService.DEFAULT_VARIANT_TYPES.includes(
          v.type_name.toLowerCase()
        )
    );
    const bulkPrices = (product.bulkPrices || []) as Array<{
      quantity: number;
      price_per_product: number;
    }>;
    const bulkPricing = bulkPrices.map((bp) => ({
      quantity: Number(bp.quantity),
      price_per_product: Number(bp.price_per_product),
    }));
    const price = Number(product.price);
    const discountNum =
      product.discount != null ? Number(product.discount) : 0;
    const totalPrice =
      product.total_price != null ? Number(product.total_price) : null;
    const priceAfterDiscount =
      totalPrice ??
      (discountNum >= 0 && discountNum <= 100
        ? price * (1 - discountNum / 100)
        : price - discountNum);
    const cost = product.cost != null ? Number(product.cost) : null;
    const freight = product.freight != null ? Number(product.freight) : null;
    const totalCost =
      (cost != null || freight != null)
        ? (cost ?? 0) + (freight ?? 0)
        : undefined;

    const startDate = product.start_discount_date;
    const endDate = product.end_discount_date;

    return {
      id: product.id,
      title: product.title,
      description: product.description ?? null,
      price,
      currency: product.currency,
      sku: product.sku,
      category_name: category?.name ?? "",
      brand_name: brand?.name ?? "",
      selling_price: price,
      cost: cost ?? undefined,
      freight: freight ?? undefined,
      tax_title: tax?.title ?? undefined,
      discount: product.discount != null ? Number(product.discount) : undefined,
      start_discount_date: startDate
        ? new Date(startDate).toISOString()
        : undefined,
      end_discount_date: endDate
        ? new Date(endDate).toISOString()
        : undefined,
      bulk_pricing: bulkPricing.length ? bulkPricing : undefined,
      total_cost: totalCost ?? undefined,
      price_after_discount: priceAfterDiscount,
      supplier_name: supplier?.supplier_name ?? undefined,
      warehouse_name: warehouse?.name ?? undefined,
      variants: variantItems.length ? variantItems : undefined,
      custom_variants: customVariantItems.length ? customVariantItems : undefined,
      weight: product.weight != null ? Number(product.weight) : undefined,
      length: product.length != null ? Number(product.length) : undefined,
      width: product.width != null ? Number(product.width) : undefined,
      height: product.height != null ? Number(product.height) : undefined,
      product_img_url: product.product_img_url ?? undefined,
      product_video_url: product.product_video_url ?? undefined,
    };
  }

  /**
   * Upsert product in the Chatbot Training API (create or update).
   * No-op if CHATBOT_TRAINING_API_URL is not set. On failure, logs and does not throw.
   */
  async upsertProduct(payload: ChatbotProductPayload): Promise<void> {
    if (!this.baseUrl) {
      return;
    }
    const url = `${this.baseUrl}/api/chatbot-training/product`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        this.logger.warn(
          `Chatbot training upsert failed: ${res.status} ${res.statusText} for product ${payload.id}`
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Chatbot training upsert error for product ${payload.id}: ${err?.message ?? err}`
      );
    }
  }

  /**
   * Delete product from the Chatbot Training API.
   * No-op if CHATBOT_TRAINING_API_URL is not set. On failure, logs and does not throw.
   */
  async deleteProduct(productId: string): Promise<void> {
    if (!this.baseUrl) {
      return;
    }
    const url = `${this.baseUrl}/api/chatbot-training/product/${encodeURIComponent(productId)}`;
    try {
      const res = await fetch(url, { method: "DELETE" });
      if (!res.ok) {
        this.logger.warn(
          `Chatbot training delete failed: ${res.status} ${res.statusText} for product ${productId}`
        );
      }
    } catch (err: any) {
      this.logger.warn(
        `Chatbot training delete error for product ${productId}: ${err?.message ?? err}`
      );
    }
  }
}
