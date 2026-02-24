export interface ProductVariant {
  name: string;
  price: number;
  image: string;
  dimensions?: { height: number; width: number; unit: string };
}
