export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  status: CategoryStatus;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CategoryListResponse {
  message: string;
  count: number;
  data: ApiCategory[];
}

export interface CategoryDetailResponse {
  message: string;
  data: ApiCategory;
}

export interface CreateCategoryPayload {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  status?: CategoryStatus;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayOrder: number | "";
  status: CategoryStatus;
}
