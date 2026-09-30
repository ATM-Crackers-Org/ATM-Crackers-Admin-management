export interface ApiStoreSettings {
  _id?: string;
  key?: string;
  storeName: string;
  tagline?: string;
  gstin?: string;
  supportPhone?: string;
  address?: string;
  receiptFooterMessage?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface StoreSettingsResponse {
  message: string;
  data: ApiStoreSettings;
}

export interface UpdateStoreSettingsPayload {
  storeName?: string;
  tagline?: string;
  gstin?: string;
  supportPhone?: string;
  address?: string;
  receiptFooterMessage?: string;
}

export interface StoreSettingsFormValues {
  storeName: string;
  tagline: string;
  gstin: string;
  supportPhone: string;
  address: string;
  receiptFooterMessage: string;
}
