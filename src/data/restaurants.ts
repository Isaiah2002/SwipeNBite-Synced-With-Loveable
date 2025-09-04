import { Restaurant } from '@/types/restaurant';
import burritoImage from '@/assets/burrito.jpg';
import ramenImage from '@/assets/ramen.jpg';
import pizzaImage from '@/assets/pizza.jpg';
import saladImage from '@/assets/salad.jpg';
import dinerImage from '@/assets/diner.jpg';
import indianImage from '@/assets/indian.jpg';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Campus Burrito Co.',
    cuisine: 'Mexican',
    price: '$',
    rating: 4.5,
    distance: 0.3,
    image: burritoImage,
    description: 'Huge burritos perfect for sharing (or not). Student favorite!',
    dietary: ['Vegetarian', 'Vegan Options'],
    deals: '50% off after 8pm',
    estimatedTime: 15
  },
  {
    id: '2', 
    name: 'Ramen Station',
    cuisine: 'Japanese',
    price: '$$',
    rating: 4.7,
    distance: 0.5,
    image: ramenImage,
    description: 'Authentic ramen bowls that will warm your soul and budget',
    dietary: ['Vegetarian Options'],
    deals: 'Buy 2 get 1 free Tuesdays',
    estimatedTime: 20
  },
  {
    id: '3',
    name: 'Pizza Paradise',
    cuisine: 'Italian',
    price: '$',
    rating: 4.2,
    distance: 0.7,
    image: pizzaImage,
    description: 'Late night pizza that actually tastes good!',
    dietary: ['Vegetarian', 'Gluten-Free'],
    deals: 'Free delivery for students',
    estimatedTime: 25
  },
  {
    id: '4',
    name: 'Green Bowl',
    cuisine: 'Healthy',
    price: '$$',
    rating: 4.4,
    distance: 0.4,
    image: saladImage,
    description: 'Fresh salads and grain bowls. Your mom would approve!',
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    estimatedTime: 12
  },
  {
    id: '5',
    name: 'Midnight Diner',
    cuisine: 'American',
    price: '$',
    rating: 4.0,
    distance: 0.6,
    image: dinerImage,
    description: 'Open 24/7. Perfect for those late study sessions.',
    dietary: ['Vegetarian Options'],
    deals: '20% off after midnight',
    estimatedTime: 18
  },
  {
    id: '6',
    name: 'Spice Route',
    cuisine: 'Indian',
    price: '$$',
    rating: 4.6,
    distance: 0.8,
    image: indianImage,
    description: 'Authentic flavors that pack a punch and great value!',
    dietary: ['Vegetarian', 'Vegan Options'],
    deals: 'Lunch buffet $8.99',
    estimatedTime: 22
  }
];