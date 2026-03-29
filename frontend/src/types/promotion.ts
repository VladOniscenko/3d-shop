export type QuotePromotionType = "buy_x_get_y" | "second_item_percent";

export interface QuotePromotionSettings {
  id: string;
  isEnabled: boolean;
  showBannerOnHome: boolean;
  promotionType: QuotePromotionType;
  buyQuantity: number;
  freeQuantity: number;
  secondItemPercentOff: number;
  bannerTextEn?: string | null;
  bannerTextNl?: string | null;
  updatedAt?: string;
  ruleSummary?: string;
}

export interface ActiveQuotePromotion {
  isActive: boolean;
  promotionType?: QuotePromotionType;
  buyQuantity?: number;
  freeQuantity?: number;
  secondItemPercentOff?: number;
  ruleSummary?: string;
  bannerTextEn?: string;
  bannerTextNl?: string;
}
