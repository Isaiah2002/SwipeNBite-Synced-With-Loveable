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
import famousBurgerSingle from '@/assets/menu/famous-burger-single.jpg';
import famousBurgerDouble from '@/assets/menu/famous-burger-double.jpg';
import baconDoubleCheese from '@/assets/menu/bacon-double-cheeseburger.jpg';
import turkeyBurger from '@/assets/menu/turkey-burger.jpg';
import bigBenBurger from '@/assets/menu/big-ben-burger.jpg';
import veggieBeyondBurger from '@/assets/menu/veggie-beyond-burger.jpg';
import veggieImpossibleBurger from '@/assets/menu/veggie-impossible-burger.jpg';
import smallChiliConCarne from '@/assets/menu/small-chili-con-carne.jpg';
import largeChiliConCarne from '@/assets/menu/large-chili-con-carne.jpg';
import smallVeggieChili from '@/assets/menu/small-veggie-chili.jpg';
import largeVeggieChili from '@/assets/menu/large-veggie-chili.jpg';
import smallTurkeyChili from '@/assets/menu/small-turkey-chili.jpg';
import largeTurkeyChili from '@/assets/menu/large-turkey-chili.jpg';
import riceBowl from '@/assets/menu/rice-bowl.jpg';
import saladBowl from '@/assets/menu/salad-bowl.jpg';
import halfGallonChiliConCarne from '@/assets/menu/half-gallon-chili-con-carne.jpg';
import gallonChiliConCarne from '@/assets/menu/gallon-chili-con-carne.jpg';
import halfGallonVeggieChili from '@/assets/menu/half-gallon-veggie-chili.jpg';
import gallonVeggieChili from '@/assets/menu/gallon-veggie-chili.jpg';
import halfGallonTurkeyChili from '@/assets/menu/half-gallon-turkey-chili.jpg';
import gallonTurkeyChili from '@/assets/menu/gallon-turkey-chili.jpg';
import mamboChickenTenders from '@/assets/menu/mambo-chicken-tenders.jpg';
import chickenTenders from '@/assets/menu/chicken-tenders.jpg';
import burgerSub from '@/assets/menu/burger-sub.jpg';
import turkeyBurgerSub from '@/assets/menu/turkey-burger-sub.jpg';
import chickenSandwich from '@/assets/menu/chicken-sandwich.jpg';
import impossibleBurgerSub from '@/assets/menu/impossible-burger-sub.jpg';
import beyondBurgerSub from '@/assets/menu/beyond-burger-sub.jpg';
import blt from '@/assets/menu/blt.jpg';
import bananaPudding from '@/assets/menu/banana-pudding.jpg';
import milkshake from '@/assets/menu/milkshake.jpg';
import cakeSlice from '@/assets/menu/cake-slice.jpg';
import iceCreamCone from '@/assets/menu/ice-cream-cone.jpg';
import iceCreamSundae from '@/assets/menu/ice-cream-sundae.jpg';
import kidsCone from '@/assets/menu/kids-cone.jpg';
import iceCreamCup from '@/assets/menu/ice-cream-cup.jpg';

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
      },
      {
        id: 'famous-burger-single',
        name: "Ben's Famous Burger - Single",
        category: 'Burgers',
        image: famousBurgerSingle,
        description: 'Our signature single patty burger'
      },
      {
        id: 'famous-burger-double',
        name: "Ben's Famous Burger - Double",
        category: 'Burgers',
        image: famousBurgerDouble,
        description: 'Double the beef, double the flavor'
      },
      {
        id: 'bacon-double-cheeseburger',
        name: 'Bacon Double Cheeseburger',
        category: 'Burgers',
        image: baconDoubleCheese,
        description: 'Toasted brioche bun with American cheese and bacon'
      },
      {
        id: 'turkey-burger',
        name: 'Turkey Burger',
        category: 'Burgers',
        image: turkeyBurger,
        description: 'Lean turkey patty burger'
      },
      {
        id: 'big-ben-burger',
        name: 'Big Ben Burger',
        category: 'Burgers',
        image: bigBenBurger,
        description: 'The biggest burger on the menu'
      },
      {
        id: 'veggie-beyond-burger',
        name: 'Veggie Beyond Burger',
        category: 'Vegetarian',
        image: veggieBeyondBurger,
        description: 'Plant-based Beyond Meat burger'
      },
      {
        id: 'veggie-impossible-burger',
        name: 'Veggie Impossible Burger',
        category: 'Vegetarian',
        image: veggieImpossibleBurger,
        description: 'Plant-based Impossible Meat burger'
      },
      {
        id: 'small-chili-con-carne',
        name: 'Small Chili Con Carne',
        category: 'Chili',
        image: smallChiliConCarne,
        description: 'Small bowl of our famous beef chili'
      },
      {
        id: 'large-chili-con-carne',
        name: 'Large Chili Con Carne',
        category: 'Chili',
        image: largeChiliConCarne,
        description: 'Large bowl of our famous beef chili'
      },
      {
        id: 'small-veggie-chili',
        name: 'Small Veggie Chili',
        category: 'Chili',
        image: smallVeggieChili,
        description: 'Small bowl of vegetarian chili'
      },
      {
        id: 'large-veggie-chili',
        name: 'Large Veggie Chili',
        category: 'Chili',
        image: largeVeggieChili,
        description: 'Large bowl of vegetarian chili'
      },
      {
        id: 'small-turkey-chili',
        name: 'Small Turkey Chili',
        category: 'Chili',
        image: smallTurkeyChili,
        description: 'Small bowl of lean turkey chili'
      },
      {
        id: 'large-turkey-chili',
        name: 'Large Turkey Chili',
        category: 'Chili',
        image: largeTurkeyChili,
        description: 'Large bowl of lean turkey chili'
      },
      {
        id: 'rice-bowl',
        name: 'Rice Bowl',
        category: 'Bowls',
        image: riceBowl,
        description: 'Rice topped with chili and toppings'
      },
      {
        id: 'salad-bowl',
        name: 'Salad Bowl',
        category: 'Bowls',
        image: saladBowl,
        description: 'Fresh salad with chili'
      },
      {
        id: 'half-gallon-chili-con-carne',
        name: '1/2 Gallon Chili Con Carne',
        category: 'Bulk Chili',
        image: halfGallonChiliConCarne,
        description: 'Half gallon of our famous beef chili to go'
      },
      {
        id: 'gallon-chili-con-carne',
        name: 'Gallon Chili Con Carne',
        category: 'Bulk Chili',
        image: gallonChiliConCarne,
        description: 'Full gallon of our famous beef chili to go'
      },
      {
        id: 'half-gallon-veggie-chili',
        name: '1/2 Gallon Veggie Chili',
        category: 'Bulk Chili',
        image: halfGallonVeggieChili,
        description: 'Half gallon of vegetarian chili to go'
      },
      {
        id: 'gallon-veggie-chili',
        name: 'Gallon Veggie Chili',
        category: 'Bulk Chili',
        image: gallonVeggieChili,
        description: 'Full gallon of vegetarian chili to go'
      },
      {
        id: 'half-gallon-turkey-chili',
        name: '1/2 Gallon Turkey Chili',
        category: 'Bulk Chili',
        image: halfGallonTurkeyChili,
        description: 'Half gallon of lean turkey chili to go'
      },
      {
        id: 'gallon-turkey-chili',
        name: 'Gallon Turkey Chili',
        category: 'Bulk Chili',
        image: gallonTurkeyChili,
        description: 'Full gallon of lean turkey chili to go'
      },
      {
        id: 'mambo-chicken-tenders',
        name: 'Mambo Chicken Tenders with Fries',
        category: 'Sandwiches & Subs',
        image: mamboChickenTenders,
        description: 'Crispy chicken tenders with fries'
      },
      {
        id: 'chicken-tenders',
        name: 'Chicken Tenders with Fries',
        category: 'Sandwiches & Subs',
        image: chickenTenders,
        description: 'Classic chicken tenders with fries'
      },
      {
        id: 'burger-sub',
        name: 'Burger Sub',
        category: 'Sandwiches & Subs',
        image: burgerSub,
        description: 'Burger patty on a sub roll'
      },
      {
        id: 'turkey-burger-sub',
        name: 'Turkey Burger Sub',
        category: 'Sandwiches & Subs',
        image: turkeyBurgerSub,
        description: 'Turkey burger patty on a sub roll'
      },
      {
        id: 'chicken-sandwich',
        name: 'Chicken Sandwich',
        category: 'Sandwiches & Subs',
        image: chickenSandwich,
        description: 'Grilled or fried chicken sandwich'
      },
      {
        id: 'impossible-burger-sub',
        name: 'Impossible Burger Sub',
        category: 'Sandwiches & Subs',
        image: impossibleBurgerSub,
        description: 'Plant-based Impossible patty on a sub roll'
      },
      {
        id: 'beyond-burger-sub',
        name: 'Beyond Burger Sub',
        category: 'Sandwiches & Subs',
        image: beyondBurgerSub,
        description: 'Plant-based Beyond patty on a sub roll'
      },
      {
        id: 'blt',
        name: 'BLT',
        category: 'Sandwiches & Subs',
        image: blt,
        description: 'Classic bacon, lettuce, and tomato sandwich'
      },
      {
        id: 'banana-pudding',
        name: "Virginia's Banana Pudding",
        category: 'Desserts',
        image: bananaPudding,
        description: 'Made with fresh bananas, heavy cream, Biscoff cookies and love'
      },
      {
        id: 'milkshake',
        name: 'Milkshake',
        category: 'Desserts',
        image: milkshake,
        description: 'Creamy milkshake in various flavors'
      },
      {
        id: 'cake-slice',
        name: 'Slice of Cake',
        category: 'Desserts',
        image: cakeSlice,
        description: 'Delicious cake slice'
      },
      {
        id: 'ice-cream-cone',
        name: 'Ice Cream Cone',
        category: 'Desserts',
        image: iceCreamCone,
        description: 'Classic ice cream cone'
      },
      {
        id: 'ice-cream-sundae',
        name: 'Ice Cream Sundae',
        category: 'Desserts',
        image: iceCreamSundae,
        description: 'Ice cream sundae with toppings'
      },
      {
        id: 'kids-cone',
        name: 'Kids Cone',
        category: 'Desserts',
        image: kidsCone,
        description: 'Kid-sized ice cream cone'
      },
      {
        id: 'ice-cream-cup',
        name: 'Ice Cream Cup',
        category: 'Desserts',
        image: iceCreamCup,
        description: 'Ice cream served in a cup'
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