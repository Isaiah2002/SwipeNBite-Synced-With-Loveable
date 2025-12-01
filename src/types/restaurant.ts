export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category: string;
  image?: string;
}

export interface DocumenuMenuItem {
  name: string;
  description?: string;
  price?: string;
  image?: string;
}

export interface DocumenuMenuSection {
  section_name: string;
  menu_items: DocumenuMenuItem[];
}

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
  address?: string;
  phone?: string;
  menu?: MenuItem[];
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
  // SerpAPI menu data
  menuAvailable?: boolean;
  menuItems?: DocumenuMenuSection[];
  restaurantPhone?: string;
  restaurantWebsite?: string;
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
  maxDistance: number | null;
  dietary: string[];
  minRating: number;
}