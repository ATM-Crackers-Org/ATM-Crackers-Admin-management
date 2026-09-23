export type ProductStatus = "ACTIVE" | "INACTIVE";

export type StockStatus = "in_stock" | "limited" | "out_of_stock";

export interface ApiProductCategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ApiProduct {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  category: ApiProductCategory | string;
  mrp: number;
  sellingPrice?: number;
  discountPercent: number;
  stockStatus: StockStatus;
  status: ProductStatus;
  displayOrder: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ProductListResponse {
  message: string;
  count: number;
  data: ApiProduct[];
}

export interface ProductDetailResponse {
  message: string;
  data: ApiProduct;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  status?: ProductStatus;
  stockStatus?: StockStatus;
}

export interface CreateProductPayload {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  images?: string[];
  mrp: number;
  discountPercent: number;
  stockStatus?: StockStatus;
  status?: ProductStatus;
  displayOrder?: number;
}

export interface UpdateProductPayload {
  categoryId?: string;
  name?: string;
  slug?: string;
  description?: string;
  images?: string[];
  mrp?: number;
  discountPercent?: number;
  stockStatus?: StockStatus;
  status?: ProductStatus;
  displayOrder?: number;
}

export interface ProductFormValues {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  mrp: number | "";
  discountPercent: number | "";
  stockStatus: StockStatus;
  status: ProductStatus;
  displayOrder: number | "";
}
