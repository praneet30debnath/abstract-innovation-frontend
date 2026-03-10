import { ProductVariant, ColorVariant } from './types';
import customizedCup from './customizedCup';
import customizedBottle from './customizedBottle';
import customizedPhotoFrame from './customizedPhotoFrame';
import customizedCushionCover from './customizedCushionCover';
import fridgeMagnet from './fridgeMagnet';
import coasters from './coasters';
import toteBag from './toteBag';
import tShirt from './tShirt';
import memento from './memento';
import customizedCandle from './customizedCandle';
import cctv from './cctv';

const productData: Record<string, ProductVariant[]> = {
  'customized-cup': customizedCup,
  'customized-bottle': customizedBottle,
  'customized-photo-frame': customizedPhotoFrame,
  'customized-cushion-cover': customizedCushionCover,
  'fridge-magnet': fridgeMagnet,
  'coasters': coasters,
  'tote-bag': toteBag,
  't-shirt': tShirt,
  'memento': memento,
  'customized-candle': customizedCandle,
  'cctv': cctv,
};

export type { ProductVariant, ColorVariant };
export default productData;
