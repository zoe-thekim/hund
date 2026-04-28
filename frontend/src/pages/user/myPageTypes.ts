export type Tab = "Profile" | "My Orders" | "Address" | "Account" | "Setting";

export interface Address {
  id: string;
  name: string;
  phone: string;
  postalCode: string;
  address: string;
  detail: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: string;
  total: string;
  status: string;
}

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
  birthday: string;
}

// Database entity types
export interface DbAddress {
  postalCode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
}

export interface DbOrderItem {
  id?: number | string | null;
  productName?: string | null;
  quantity?: number | null;
  size?: string | null;
  unitPrice?: number | string | null;
}

export interface DbOrder {
  id?: number | string | null;
  orderNumber?: string | null;
  totalAmount?: number | string | null;
  status?: string | null;
  orderedAt?: string | null;
  createdAt?: string | null;
  deliveryAddress?: DbAddress | null;
  deliveryPostCode?: string | null;
  orderItems?: DbOrderItem[] | null;
}

export interface DbUserAddress {
  postalCode?: string | null;
  address?: string | null;
  detailAddress?: string | null;
}

// AuthUser type for better type safety
export interface AuthUser {
  id?: number | string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  birthDate?: string;
  birthday?: string;
  profileImageUrl?: string;
  address?: DbUserAddress | null;
  agreeToMarketing?: boolean;
  agree_to_marketing?: boolean;
  [key: string]: unknown; // Allow additional properties for extensibility
}

// Daum postcode service type definition
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          zonecode: string;
          address: string;
          addressType: string;
          userSelectedType: string;
          noSelected: string;
          userLanguageType: string;
          roadAddress: string;
          jibunAddress: string;
          buildingName: string;
          apartment: string;
          autoRoadAddress: string;
          autoJibunAddress: string;
          sido: string;
          sigungu: string;
          bname: string;
          roadname: string;
        }) => void;
        onresize?: (size: { width: number; height: number }) => void;
        width?: string;
        height?: string;
      }) => {
        open: () => void;
      };
    };
  }
}
