// Status do presente: available | reserved | paid | received
export const STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  PAID: 'paid',
  RECEIVED: 'received'
} as const;

export type ProductStatus = (typeof STATUS)[keyof typeof STATUS];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  paid: 'Pago (conferir)',
  received: 'Recebido'
};

export interface Product {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number | null;
  status?: ProductStatus;
  reservedBy?: string | null;
  comment?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  reservedAt?: Date;
  paidAt?: Date;
  receivedAt?: Date;
}

export interface CoupleSettings {
  brideName?: string;
  groomName?: string;
  pixKey?: string;
  weddingDate?: string;
  publicMessage?: string;
  paletteId?: string;
}

// Docs antigos não têm `status`: deriva de reservedBy
export const getProductStatus = (
  product?: { status?: ProductStatus; reservedBy?: string | null } | null
): ProductStatus => {
  if (product?.status) return product.status;
  return product?.reservedBy ? STATUS.RESERVED : STATUS.AVAILABLE;
};

export const formatPrice = (price?: number | null): string | null =>
  typeof price === 'number'
    ? price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : null;
