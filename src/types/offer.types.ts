export type OfferScope = "GLOBAL" | "CATEGORY" | "PRODUCT";
export type OfferStatus = "ACTIVE" | "INACTIVE";

export interface ApiOffer {
  _id: string;
  name: string;
  description?: string;
  discountPercent: number;
  scope: OfferScope;
  categoryIds?: string[];
  productIds?: string[];
  startAt: string;
  expiresAt: string;
  status: OfferStatus;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface OfferListResponse {
  message: string;
  count?: number;
  data: ApiOffer[];
}

export interface OfferDetailResponse {
  message: string;
  data: ApiOffer;
}

export interface CreateOfferPayload {
  name: string;
  description?: string;
  discountPercent: number;
  scope: OfferScope;
  categoryIds?: string[];
  productIds?: string[];
  startAt: string;
  expiresAt: string;
  status?: OfferStatus;
}

export interface UpdateOfferPayload {
  name?: string;
  description?: string;
  discountPercent?: number;
  scope?: OfferScope;
  categoryIds?: string[];
  productIds?: string[];
  startAt?: string;
  expiresAt?: string;
  status?: OfferStatus;
}

export interface OfferFormValues {
  name: string;
  description: string;
  discountPercent: number | "";
  scope: OfferScope;
  categoryIds: string[];
  productIds: string[];
  startAt: string;
  expiresAt: string;
  status: OfferStatus;
}
