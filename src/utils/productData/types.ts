export interface ColorVariant {
  hex: string;
  name: string;
  image: string;
}

export interface ProductVariant {
  name: string;
  price: number;
  image: string;
  images?: string[];
  dimensions?: { height: number; width: number; unit: string };
  colors?: ColorVariant[];
}
