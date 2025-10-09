export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  price: '$' | '$$' | '$$$';
  rating: number;
  distance: number; // in miles
  image: string;
  description: string;
  dietary: string[];
  deals?: string;
  estimatedTime: number; // minutes
  latitude?: number;
  longitude?: number;
  // Google Maps data
  placeId?: string;
  mapsUrl?: string;
  googleRating?: number;
  photos?: string[];
  // Yelp data
  yelpId?: string;
  yelpUrl?: string;
  yelpRating?: number;
  reviewCount?: number;
  reviews?: YelpReview[];
  // OpenTable data
  reservationUrl?: string;
  openTableAvailable?: boolean;
}

export interface YelpReview {
  id: string;
  rating: number;
  text: string;
  user: string;
  timeCreated: string;
}

export interface Filters {
  maxPrice: '$' | '$$' | '$$$';
  maxDistance: number;
  dietary: string[];
  minRating: number;
}