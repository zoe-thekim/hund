import type {
  Address,
  Order,
  UserInfo,
  AuthUser,
  DbOrder,
  DbAddress,
  DbUserAddress
} from './myPageTypes';

// Date utility
export const getDateString = (value?: string | null): string => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString().split("T")[0];
};

// Price formatting utility
export const toPriceText = (value: number | string | null | undefined): string => {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) {
    return "₩0";
  }
  return `₩${amount.toLocaleString("en-US")}`;
};

// Order status formatting
export const formatOrderStatus = (status: string): string => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "DELIVERED":
      return "Delivered";
    case "SHIPPED":
    case "PROCESSING":
      return "In Transit";
    case "CONFIRMED":
      return "Confirmed";
    case "CANCELLED":
      return "Cancelled";
    case "PENDING":
    default:
      return "Processing";
  }
};

// Boolean conversion utility
export const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return false;
};

// Phone number extraction from user
export const toPhoneFromUser = (user: AuthUser | null): string => {
  if (!user) {
    return "";
  }
  const raw = (user.phoneNumber ?? user.phone) as string;
  return typeof raw === "string" && !raw.includes("@") ? raw : "";
};

// Profile image extraction from user
export const getProfileImageFromUser = (user: AuthUser | null): string => {
  const image = user?.profileImageUrl;
  if (typeof image === "string" && image.trim()) {
    return image;
  }
  return "/placeholder.svg";
};

// Marketing agreement extraction from user
export const getMarketingAgreement = (user: AuthUser | null): boolean => {
  if (!user) {
    return false;
  }

  return toBoolean(user.agreeToMarketing ?? user.agree_to_marketing);
};

// User profile extraction
export const getProfileFromUser = (user: AuthUser | null): UserInfo => {
  if (!user) {
    return {
      name: "",
      email: "",
      phone: "",
      birthday: "",
    };
  }

  const rawPhone = user.phoneNumber ?? user.phone ?? "";
  const phone = typeof rawPhone === "string" && !rawPhone.includes("@") ? rawPhone : "";

  return {
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    birthday: String(user.birthDate ?? user.birthday ?? ""),
    phone,
  };
};

// Order normalization
export const normalizeMyOrder = (order: DbOrder): Order | null => {
  if (!order || typeof order !== "object") {
    return null;
  }

  const id = String(order.id ?? "").trim();
  if (!id) {
    return null;
  }

    const items = Array.isArray(order.orderItems)
    ? order.orderItems
        .filter((item) => item && typeof item === "object")
        .map((item) => `${item.productName ?? "Product"} (${item.quantity ?? "1"} pcs, ${item.size ?? "-"})`)
        .join(", ")
    : "No items";

  return {
    id,
    orderNumber: order.orderNumber ?? id,
    date: getDateString(order.orderedAt ?? order.createdAt),
    items: items || "No items",
    total: toPriceText(order.totalAmount),
    status: order.status ?? "PENDING",
  };
};

// Address list generation
export const toAddressList = (user: AuthUser | null, orders: DbOrder[]): Address[] => {
  const result: Address[] = [];
  const seen = new Set<string>();
  const phone = toPhoneFromUser(user);
  const userId = String(user?.id ?? "unknown");

  const addAddress = (next: Address) => {
    const key = `${next.postalCode}|${next.address}|${next.detail}|${next.name}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(next);
  };

  const userAddress = user?.address ?? null;
  if (
    userAddress &&
    (userAddress.postalCode || userAddress.address || userAddress.detailAddress)
  ) {
    addAddress({
      id: `user-${userId}`,
      name: "Primary Address",
      phone: phone || "-",
      postalCode: userAddress.postalCode ?? "",
      address: userAddress.address ?? "",
      detail: userAddress.detailAddress ?? "",
      isDefault: true,
    });
  }

  orders.forEach((order) => {
    const address = order.deliveryAddress;
    if (!address || (!address.postalCode && !address.address && !address.detailAddress)) {
      return;
    }

    addAddress({
      id: `order-${String(order.id ?? order.orderNumber ?? "0")}`,
      name: `Delivery address for ${order.orderNumber ?? order.id}`,
      phone,
      postalCode: address.postalCode ?? "",
      address: address.address ?? "",
      detail: address.detailAddress ?? "",
      isDefault: false,
    });
  });

  return result;
};
