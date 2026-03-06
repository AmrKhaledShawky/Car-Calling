export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  seats: number;
  fuel: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  color: string;
  category: 'Sedan' | 'SUV' | 'Sports' | 'Luxury' | 'Electric' | 'Van';
  image: string;
  rating: number;
  isNew: boolean;
  isLongTripFriendly: boolean;
}

export type SortOption = 'price-low' | 'price-high' | 'year-new' | 'rating';
