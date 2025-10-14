import { Restaurant } from '@/types/restaurant';
import burritoImage from '@/assets/burrito.jpg';
import ramenImage from '@/assets/ramen.jpg';
import pizzaImage from '@/assets/pizza.jpg';
import saladImage from '@/assets/salad.jpg';
import dinerImage from '@/assets/diner.jpg';
import indianImage from '@/assets/indian.jpg';
import halfSmokeOriginal from '@/assets/menu/half-smoke-original.jpg';
import turkeyDog from '@/assets/menu/turkey-dog.jpg';
import halfSmokeSpicy from '@/assets/menu/half-smoke-spicy.jpg';
import juniorDog from '@/assets/menu/junior-dog.jpg';
import beefDog from '@/assets/menu/beef-dog.jpg';
import veggieDog from '@/assets/menu/veggie-dog.jpg';

export const restaurants: Restaurant[] = [
  {
    id: '1',
    name: "Ben's Chili Bowl",
    cuisine: 'American',
    price: '$',
    rating: 4.6,
    distance: 0.8,
    image: burritoImage,
    description: 'DC institution since 1958! Famous chili dogs and half-smokes. A must-try for every Howard student.',
    dietary: ['Vegetarian Options'],
    deals: 'Student discount with Howard ID',
    estimatedTime: 12,
    latitude: 38.9170,
    longitude: -77.0281,
    menu: [
      {
        id: 'hs-original',
        name: 'Original Half Smoke',
        category: 'Signature',
        image: halfSmokeOriginal,
        description: 'Our famous original half smoke with chili'
      },
      {
        id: 'turkey-dog',
        name: 'Jumbo Turkey Dog',
        category: 'Hot Dogs',
        image: turkeyDog,
        description: 'Jumbo turkey hot dog'
      },
      {
        id: 'hs-spicy',
        name: 'Spicy Chili Half Smoke',
        category: 'Signature',
        image: halfSmokeSpicy,
        description: 'Half smoke with our spicy chili'
      },
      {
        id: 'junior-dog',
        name: 'Junior Dog',
        category: 'Hot Dogs',
        image: juniorDog,
        description: 'Perfect size hot dog for lighter appetites'
      },
      {
        id: 'beef-dog',
        name: 'Jumbo Beef Dog',
        category: 'Hot Dogs',
        image: beefDog,
        description: 'All-beef jumbo hot dog'
      },
      {
        id: 'veggie-dog',
        name: 'Veggie Dog',
        category: 'Vegetarian',
        image: veggieDog,
        description: 'Vegetarian hot dog option'
      }
    ]
  },
  {
    id: '2',
    name: 'Minya\'s Pizza',
    cuisine: 'Italian',
    price: '$',
    rating: 4.3,
    distance: 0.2,
    image: pizzaImage,
    description: 'Premium pizza delivery right to Howard campus. Open late for those study sessions!',
    dietary: ['Vegetarian', 'Gluten-Free Options'],
    deals: 'Free delivery to campus',
    estimatedTime: 25,
    latitude: 38.9200,
    longitude: -77.0180
  },
  {
    id: '3',
    name: 'Chick-fil-A Blackburn',
    cuisine: 'American',
    price: '$',
    rating: 4.4,
    distance: 0.1,
    image: dinerImage,
    description: 'Right on campus in the Blackburn Student Center. Fresh, quality chicken (closed Sundays).',
    dietary: ['Gluten-Free Options'],
    deals: 'Meal plan accepted',
    estimatedTime: 8,
    latitude: 38.9222,
    longitude: -77.0194
  },
  {
    id: '4',
    name: 'Florida Avenue Grill',
    cuisine: 'Soul Food',
    price: '$$',
    rating: 4.5,
    distance: 1.2,
    image: indianImage,
    description: 'World\'s oldest soul food restaurant! Authentic Southern comfort food that feels like home.',
    dietary: ['Vegetarian Options'],
    deals: '15% student discount',
    estimatedTime: 20,
    latitude: 38.9180,
    longitude: -77.0210
  },
  {
    id: '5',
    name: 'Busboys and Poets',
    cuisine: 'American',
    price: '$$',
    rating: 4.2,
    distance: 0.9,
    image: saladImage,
    description: 'Restaurant, bookstore, and community space. Great for study dates and social change discussions.',
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
    deals: 'Happy hour 3-6pm daily',
    estimatedTime: 18,
    latitude: 38.9160,
    longitude: -77.0270
  },
  {
    id: '6',
    name: 'Chidogo\'s',
    cuisine: 'American',
    price: '$',
    rating: 4.1,
    distance: 0.6,
    image: burritoImage,
    description: 'Chicago-style hot dogs and Italian beef sandwiches. Authentic Windy City flavors in DC!',
    dietary: ['Vegetarian Options'],
    deals: 'Student combo meals',
    estimatedTime: 15,
    latitude: 38.9150,
    longitude: -77.0320
  },
  {
    id: '7',
    name: 'Howard Thai Restaurant',
    cuisine: 'Thai',
    price: '$$',
    rating: 4.3,
    distance: 0.5,
    image: ramenImage,
    description: 'Authentic Thai cuisine with student-friendly portions. Perfect spice levels for everyone.',
    dietary: ['Vegetarian', 'Vegan Options'],
    deals: '20% off pickup orders',
    estimatedTime: 22,
    latitude: 38.9190,
    longitude: -77.0230
  },
  {
    id: '8',
    name: 'The Coupe',
    cuisine: 'Cafe',
    price: '$',
    rating: 4.0,
    distance: 0.7,
    image: saladImage,
    description: 'Coffee shop and eatery perfect for studying. Great WiFi, better sandwiches and salads.',
    dietary: ['Vegetarian', 'Vegan Options'],
    deals: 'Free WiFi + study space',
    estimatedTime: 10,
    latitude: 38.9240,
    longitude: -77.0380
  },
  {
    id: '9',
    name: 'U Street Market',
    cuisine: 'International',
    price: '$',
    rating: 4.2,
    distance: 0.8,
    image: indianImage,
    description: 'Food hall with diverse vendors. Ethiopian, Caribbean, Mediterranean - something for everyone!',
    dietary: ['Vegetarian', 'Vegan', 'Halal', 'Kosher'],
    deals: 'Mix and match vendors',
    estimatedTime: 15,
    latitude: 38.9165,
    longitude: -77.0290
  },
  {
    id: '10',
    name: 'Taco Bamba Shaw',
    cuisine: 'Mexican',
    price: '$',
    rating: 4.4,
    distance: 1.0,
    image: burritoImage,
    description: 'Modern Mexican with creative tacos and burritos. Late night hours for the campus crowd.',
    dietary: ['Vegetarian', 'Vegan Options'],
    deals: 'Taco Tuesday specials',
    estimatedTime: 16,
    latitude: 38.9135,
    longitude: -77.0255
  }
];