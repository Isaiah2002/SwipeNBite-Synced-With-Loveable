import { Restaurant } from '@/types/restaurant';
import burritoImage from '@/assets/burrito.jpg';
import ramenImage from '@/assets/ramen.jpg';
import pizzaImage from '@/assets/pizza.jpg';
import saladImage from '@/assets/salad.jpg';
import dinerImage from '@/assets/diner.jpg';
import indianImage from '@/assets/indian.jpg';
// The Coupe menu - real photos from Toast Tab
import coupeLatte from '@/assets/menu/coupe-latte.jpg';
import coupeIcedLatte from '@/assets/menu/coupe-iced-latte.jpg';
import coupeBurger from '@/assets/menu/coupe-burger-real.jpg';
import coupeBreakfastBurrito from '@/assets/menu/coupe-breakfast-burrito-real.jpg';
import coupeAvocadoToast from '@/assets/menu/coupe-avocado-toast-real.jpg';
import coupePancakes from '@/assets/menu/coupe-pancakes-real.jpg';
import coupeHuevosRancheros from '@/assets/menu/coupe-huevos-rancheros.jpg';
import coupeFrenchToast from '@/assets/menu/coupe-french-toast.jpg';
import coupeChickenWaffle from '@/assets/menu/coupe-chicken-waffle.jpg';
import coupeYogurtParfait from '@/assets/menu/coupe-yogurt-parfait.jpg';
import coupeCaesarSalad from '@/assets/menu/coupe-caesar-salad.jpg';
import coupeBowl from '@/assets/menu/coupe-bowl.jpg';
import coupeClassicCobb from '@/assets/menu/coupe-classic-cobb.jpg';
import coupeWings from '@/assets/menu/coupe-wings.jpg';
import coupeFries from '@/assets/menu/coupe-fries.jpg';
import coupeSteakFrites from '@/assets/menu/coupe-steak-frites.jpg';
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
import cheesePizza from '@/assets/menu/cheese-pizza.jpg';
import pepperoniPizza from '@/assets/menu/pepperoni-pizza.jpg';
import margheritaPizza from '@/assets/menu/margherita-pizza.jpg';
import veggiePizza from '@/assets/menu/veggie-pizza.jpg';
import meatLoversPizza from '@/assets/menu/meat-lovers-pizza.jpg';
import bbqChickenPizza from '@/assets/menu/bbq-chicken-pizza.jpg';
import whiteCheesePizza from '@/assets/menu/white-cheese-pizza.jpg';
import veganPizza from '@/assets/menu/vegan-pizza.jpg';
import hangoverPizza from '@/assets/menu/hangover-pizza.jpg';
import spicyHawaiianPizza from '@/assets/menu/spicy-hawaiian-pizza.jpg';
import derhoPizza from '@/assets/menu/derho-pizza.jpg';
import amaterePizza from '@/assets/menu/amatere-pizza.jpg';
import mushroomPizza from '@/assets/menu/mushroom-pizza.jpg';
import asmarinoPizza from '@/assets/menu/asmarino-pizza.jpg';
import ferroviaPizza from '@/assets/menu/ferrovia-pizza.jpg';
import vilaggioPizza from '@/assets/menu/vilaggio-pizza.jpg';
import polpettePanino from '@/assets/menu/polpette-panino.jpg';
import prosciuttoPanino from '@/assets/menu/prosciutto-panino.jpg';
import chickenParmaPanino from '@/assets/menu/chicken-parma-panino.jpg';
import minyasMixSalad from '@/assets/menu/minyas-mix-salad.jpg';
import arugulaSalad from '@/assets/menu/arugula-salad.jpg';
import caesarSalad from '@/assets/menu/caesar-salad.jpg';
import buffaloWings from '@/assets/menu/buffalo-wings.jpg';
import cheeseFries from '@/assets/menu/cheese-fries.jpg';
import meatballs from '@/assets/menu/meatballs.jpg';
import garlicBread from '@/assets/menu/garlic-bread.jpg';
import ranchDip from '@/assets/menu/ranch-dip.jpg';
import blueCheeseDip from '@/assets/menu/blue-cheese-dip.jpg';
import coolDrinks from '@/assets/menu/cool-drinks.jpg';
import freshJuice from '@/assets/menu/fresh-juice.jpg';
import sanPellegrinoCan from '@/assets/menu/san-pellegrino-can.jpg';
import sanPellegrinoBottle from '@/assets/menu/san-pellegrino-bottle.jpg';
import waterBottle from '@/assets/menu/water-bottle.jpg';
import tiramisuDessert from '@/assets/menu/tiramisu-dessert.jpg';
import chickfilaChickenSandwich from '@/assets/menu/chickfila-chicken-sandwich.jpg';
import spicyChickenSandwich from '@/assets/menu/spicy-chicken-sandwich.jpg';
import chickfilaNuggets from '@/assets/menu/chickfila-nuggets.jpg';
import grilledNuggets from '@/assets/menu/grilled-nuggets.jpg';
import chickfilaDeluxeSandwich from '@/assets/menu/chickfila-deluxe-sandwich.jpg';
import chickfilaCoolWrap from '@/assets/menu/chickfila-cool-wrap.jpg';
import chickfilaChickNStrips from '@/assets/menu/chickfila-chick-n-strips.jpg';
import grilledChickenSandwich from '@/assets/menu/grilled-chicken-sandwich.jpg';
import cobbSalad from '@/assets/menu/cobb-salad.jpg';
import spicySouthwestSalad from '@/assets/menu/spicy-southwest-salad.jpg';
import marketSalad from '@/assets/menu/market-salad.jpg';
import chickfilaChickenBiscuit from '@/assets/menu/chickfila-chicken-biscuit.jpg';
import chickfilaSpicyChickenBiscuit from '@/assets/menu/chickfila-spicy-chicken-biscuit.jpg';
import chickfilaChickNMinis from '@/assets/menu/chickfila-chick-n-minis.jpg';
import chickfilaEggWhiteGrill from '@/assets/menu/chickfila-egg-white-grill.jpg';
import chickfilaHashBrownScrambleBurrito from '@/assets/menu/chickfila-hash-brown-scramble-burrito.jpg';
import chickfilaHashBrownScrambleBowl from '@/assets/menu/chickfila-hash-brown-scramble-bowl.jpg';
import chickfilaChickenEggCheeseBiscuit from '@/assets/menu/chickfila-chicken-egg-cheese-biscuit.jpg';
import chickfilaBaconEggCheeseBiscuit from '@/assets/menu/chickfila-bacon-egg-cheese-biscuit.jpg';
import chickfilaSausageEggCheeseBiscuit from '@/assets/menu/chickfila-sausage-egg-cheese-biscuit.jpg';
import chickfilaChickenEggCheeseMuffin from '@/assets/menu/chickfila-chicken-egg-cheese-muffin.jpg';
import chickfilaBaconEggCheeseMuffin from '@/assets/menu/chickfila-bacon-egg-cheese-muffin.jpg';
import chickfilaSausageEggCheeseMuffin from '@/assets/menu/chickfila-sausage-egg-cheese-muffin.jpg';
import chickfilaHashBrowns from '@/assets/menu/chickfila-hash-browns.jpg';
import chickfilaBerryParfait from '@/assets/menu/chickfila-berry-parfait.jpg';
import chickfilaFruitCup from '@/assets/menu/chickfila-fruit-cup.jpg';
import chickfilaWaffleFries from '@/assets/menu/chickfila-waffle-fries.jpg';
import chickfilaFruitCupSide from '@/assets/menu/chickfila-fruit-cup-side.jpg';
import chickfilaSideSalad from '@/assets/menu/chickfila-side-salad.jpg';
import chickfilaMacCheese from '@/assets/menu/chickfila-mac-cheese.jpg';
import chickfilaChickenNoodleSoup from '@/assets/menu/chickfila-chicken-noodle-soup.jpg';
import chickfilaChickenTortillaSoup from '@/assets/menu/chickfila-chicken-tortilla-soup.jpg';
import chickfilaWaffleChips from '@/assets/menu/chickfila-waffle-chips.jpg';
import chickfilaSauceWaffleChips from '@/assets/menu/chickfila-sauce-waffle-chips.jpg';
import chickfilaAppleSauce from '@/assets/menu/chickfila-apple-sauce.jpg';
import chickfilaKaleCrunch from '@/assets/menu/chickfila-kale-crunch.jpg';
import chickfilaBerryParfaitSide from '@/assets/menu/chickfila-berry-parfait-side.jpg';
import chickfilaCherryBerryFrostedLemonade from '@/assets/menu/chickfila-cherry-berry-frosted-lemonade.jpg';
import chickfilaFrostedLemonade from '@/assets/menu/chickfila-frosted-lemonade.jpg';
import chickfilaFrostedCoffee from '@/assets/menu/chickfila-frosted-coffee.jpg';
import chickfilaVanillaMilkshake from '@/assets/menu/chickfila-vanilla-milkshake.jpg';
import chickfilaCookiesCreamMilkshake from '@/assets/menu/chickfila-cookies-cream-milkshake.jpg';
import chickfilaChocolateMilkshake from '@/assets/menu/chickfila-chocolate-milkshake.jpg';
import chickfilaStrawberryMilkshake from '@/assets/menu/chickfila-strawberry-milkshake.jpg';
import chickfilaIcedreamCup from '@/assets/menu/chickfila-icedream-cup.jpg';
import chickfilaIcedreamCone from '@/assets/menu/chickfila-icedream-cone.jpg';
import chickfilaChocolateChunkCookie from '@/assets/menu/chickfila-chocolate-chunk-cookie.jpg';
import chickfilaChocolateFudgeBrownie from '@/assets/menu/chickfila-chocolate-fudge-brownie.jpg';
import chickfilaBarbequeSauce from '@/assets/menu/chickfila-barbeque-sauce.jpg';
import chickfilaSignatureSauce from '@/assets/menu/chickfila-signature-sauce.jpg';
import chickfilaGardenHerbRanch from '@/assets/menu/chickfila-garden-herb-ranch.jpg';
import chickfilaHoneyMustard from '@/assets/menu/chickfila-honey-mustard.jpg';
import chickfilaPolynesianSauce from '@/assets/menu/chickfila-polynesian-sauce.jpg';
import chickfilaSrirachaSauce from '@/assets/menu/chickfila-sriracha-sauce.jpg';
import chickfilaHoneyRoastedBBQ from '@/assets/menu/chickfila-honey-roasted-bbq.jpg';
import chickfilaZestyBuffalo from '@/assets/menu/chickfila-zesty-buffalo.jpg';

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
    longitude: -77.0180,
    menu: [
      {
        id: 'cheese-pizza',
        name: 'Cheese Pizza',
        category: 'Pizzas',
        image: cheesePizza,
        description: 'Classic cheese pizza with mozzarella'
      },
      {
        id: 'pepperoni-pizza',
        name: 'Pepperoni Pizza',
        category: 'Pizzas',
        image: pepperoniPizza,
        description: 'Traditional pepperoni pizza'
      },
      {
        id: 'margherita-pizza',
        name: 'Margherita Pizza',
        category: 'Pizzas',
        image: margheritaPizza,
        description: 'Fresh mozzarella, tomatoes, and basil'
      },
      {
        id: 'veggie-pizza',
        name: 'Veggie Pizza',
        category: 'Pizzas',
        image: veggiePizza,
        description: 'Loaded with fresh vegetables'
      },
      {
        id: 'meat-lovers-pizza',
        name: 'Meat Lovers Pizza',
        category: 'Pizzas',
        image: meatLoversPizza,
        description: 'Packed with assorted meats'
      },
      {
        id: 'bbq-chicken-pizza',
        name: 'BBQ Chicken Pizza',
        category: 'Pizzas',
        image: bbqChickenPizza,
        description: 'BBQ sauce, grilled chicken, and red onions'
      },
      {
        id: 'white-cheese-pizza',
        name: 'White Cheese Pizza',
        category: 'Pizzas',
        image: whiteCheesePizza,
        description: 'White sauce with multiple cheeses'
      },
      {
        id: 'vegan-pizza',
        name: 'Vegan Pizza',
        category: 'Pizzas',
        image: veganPizza,
        description: 'Plant-based cheese and fresh vegetables'
      },
      {
        id: 'hangover-pizza',
        name: 'Hangover Pizza',
        category: 'Pizzas',
        image: hangoverPizza,
        description: 'Loaded specialty pizza perfect for late night'
      },
      {
        id: 'spicy-hawaiian-pizza',
        name: 'Spicy Hawaiian Pizza',
        category: 'Pizzas',
        image: spicyHawaiianPizza,
        description: 'Pineapple, ham, and spicy jalapeños'
      },
      {
        id: 'derho-pizza',
        name: 'Derho Pizza',
        category: 'Pizzas',
        image: derhoPizza,
        description: 'Ethiopian-inspired specialty pizza'
      },
      {
        id: 'amatere-pizza',
        name: 'Amatere Pizza',
        category: 'Pizzas',
        image: amaterePizza,
        description: 'Specialty pizza with unique toppings'
      },
      {
        id: 'mushroom-pizza',
        name: 'Mushroom Pizza',
        category: 'Pizzas',
        image: mushroomPizza,
        description: 'Loaded with fresh mushrooms'
      },
      {
        id: 'asmarino-pizza',
        name: 'Asmarino Pizza',
        category: 'Pizzas',
        image: asmarinoPizza,
        description: 'Signature specialty pizza'
      },
      {
        id: 'ferrovia-pizza',
        name: 'Ferrovia Pizza',
        category: 'Pizzas',
        image: ferroviaPizza,
        description: 'Italian-style specialty pizza'
      },
      {
        id: 'vilaggio-pizza',
        name: 'Vilaggio Pizza',
        category: 'Pizzas',
        image: vilaggioPizza,
        description: 'Village-style specialty pizza'
      },
      {
        id: 'polpette-panino',
        name: 'Polpette Panino',
        category: 'Panini',
        image: polpettePanino,
        description: 'Italian meatball sandwich'
      },
      {
        id: 'prosciutto-panino',
        name: 'Prosciutto Panino',
        category: 'Panini',
        image: prosciuttoPanino,
        description: 'Prosciutto Italian sandwich'
      },
      {
        id: 'chicken-parma-panino',
        name: 'Chicken Parma Panino',
        category: 'Panini',
        image: chickenParmaPanino,
        description: 'Chicken Parmesan sandwich'
      },
      {
        id: 'minyas-mix-salad',
        name: "Minya's Mix Salad",
        category: 'Salads',
        image: minyasMixSalad,
        description: 'House special mixed greens salad'
      },
      {
        id: 'arugula-salad',
        name: 'Arugula Salad',
        category: 'Salads',
        image: arugulaSalad,
        description: 'Fresh arugula with toppings'
      },
      {
        id: 'caesar-salad',
        name: 'Caesar Salad',
        category: 'Salads',
        image: caesarSalad,
        description: 'Classic Caesar salad'
      },
      {
        id: 'buffalo-wings',
        name: 'Buffalo Wings',
        category: 'Appetizers',
        image: buffaloWings,
        description: 'Spicy buffalo chicken wings'
      },
      {
        id: 'cheese-fries',
        name: 'Cheese Fries',
        category: 'Appetizers',
        image: cheeseFries,
        description: 'Fries covered in melted cheese'
      },
      {
        id: 'meatballs',
        name: 'Meatballs',
        category: 'Appetizers',
        image: meatballs,
        description: 'Italian-style meatballs'
      },
      {
        id: 'garlic-bread',
        name: 'Garlic Bread',
        category: 'Appetizers',
        image: garlicBread,
        description: 'Toasted bread with garlic butter'
      },
      {
        id: 'ranch-dip',
        name: 'Ranch Dip',
        category: 'Extras',
        image: ranchDip,
        description: 'Creamy ranch dipping sauce'
      },
      {
        id: 'blue-cheese-dip',
        name: 'Blue Cheese Dip',
        category: 'Extras',
        image: blueCheeseDip,
        description: 'Tangy blue cheese dipping sauce'
      },
      {
        id: 'cool-drinks',
        name: 'Cool Drinks',
        category: 'Beverages',
        image: coolDrinks,
        description: 'Assorted soft drinks'
      },
      {
        id: 'fresh-juice',
        name: 'Fresh Juice',
        category: 'Beverages',
        image: freshJuice,
        description: 'Freshly squeezed juice'
      },
      {
        id: 'san-pellegrino-can',
        name: 'San Pellegrino Can',
        category: 'Beverages',
        image: sanPellegrinoCan,
        description: 'Italian sparkling fruit beverage'
      },
      {
        id: 'san-pellegrino-bottle',
        name: 'San Pellegrino Bottle',
        category: 'Beverages',
        image: sanPellegrinoBottle,
        description: 'Sparkling mineral water'
      },
      {
        id: 'water-bottle',
        name: 'Water Bottle',
        category: 'Beverages',
        image: waterBottle,
        description: 'Bottled water'
      },
      {
        id: 'tiramisu-dessert',
        name: 'Tiramisu Dessert',
        category: 'Desserts',
        image: tiramisuDessert,
        description: 'Classic Italian tiramisu'
      }
    ]
  },
  {
    id: '3',
    name: 'Chick-fil-A Blackburn',
    cuisine: 'American',
    price: '$',
    rating: 4.4,
    distance: 0.1,
    image: chickfilaChickenSandwich,
    description: 'Right on campus in the Blackburn Student Center. Fresh, quality chicken (closed Sundays).',
    dietary: ['Gluten-Free Options'],
    deals: 'Meal plan accepted',
    estimatedTime: 8,
    latitude: 38.9222,
    longitude: -77.0194,
    menu: [
      {
        id: 'chickfila-chicken-sandwich',
        name: 'Chick-fil-A Chicken Sandwich',
        category: 'Entrees',
        image: chickfilaChickenSandwich,
        description: 'Our original pressure-cooked chicken sandwich'
      },
      {
        id: 'spicy-chicken-sandwich',
        name: 'Spicy Chicken Sandwich',
        category: 'Entrees',
        image: spicyChickenSandwich,
        description: 'Spicy version of our famous chicken sandwich'
      },
      {
        id: 'chickfila-nuggets',
        name: 'Chick-fil-A Nuggets',
        category: 'Entrees',
        image: chickfilaNuggets,
        description: 'Bite-sized pieces of tender chicken'
      },
      {
        id: 'grilled-nuggets',
        name: 'Grilled Nuggets',
        category: 'Entrees',
        image: grilledNuggets,
        description: 'Grilled chicken nuggets'
      },
      {
        id: 'chickfila-deluxe-sandwich',
        name: 'Chick-fil-A Deluxe Sandwich',
        category: 'Entrees',
        image: chickfilaDeluxeSandwich,
        description: 'Chicken sandwich with lettuce, tomato, and cheese'
      },
      {
        id: 'chickfila-cool-wrap',
        name: 'Chick-fil-A Cool Wrap',
        category: 'Entrees',
        image: chickfilaCoolWrap,
        description: 'Grilled chicken with lettuce in a wrap'
      },
      {
        id: 'chickfila-chick-n-strips',
        name: 'Chick-fil-A Chick-n-Strips',
        category: 'Entrees',
        image: chickfilaChickNStrips,
        description: 'Crispy chicken strips'
      },
      {
        id: 'grilled-chicken-sandwich',
        name: 'Grilled Chicken Sandwich',
        category: 'Entrees',
        image: grilledChickenSandwich,
        description: 'Grilled chicken breast on a bun'
      },
      {
        id: 'cobb-salad',
        name: 'Cobb Salad',
        category: 'Salads',
        image: cobbSalad,
        description: 'Fresh salad with chicken, bacon, and hard-boiled egg'
      },
      {
        id: 'spicy-southwest-salad',
        name: 'Spicy Southwest Salad',
        category: 'Salads',
        image: spicySouthwestSalad,
        description: 'Spicy salad with corn, black beans, and peppers'
      },
      {
        id: 'market-salad',
        name: 'Market Salad',
        category: 'Salads',
        image: marketSalad,
        description: 'Fresh greens with apples, strawberries, and blueberries'
      },
      {
        id: 'chickfila-chicken-biscuit',
        name: 'Chick-fil-A Chicken Biscuit',
        category: 'Breakfast',
        image: chickfilaChickenBiscuit,
        description: 'Chicken filet on a buttermilk biscuit'
      },
      {
        id: 'chickfila-spicy-chicken-biscuit',
        name: 'Spicy Chicken Biscuit',
        category: 'Breakfast',
        image: chickfilaSpicyChickenBiscuit,
        description: 'Spicy chicken filet on a buttermilk biscuit'
      },
      {
        id: 'chickfila-chick-n-minis',
        name: 'Chick-n-Minis (4 ct)',
        category: 'Breakfast',
        image: chickfilaChickNMinis,
        description: 'Bite-sized chicken nuggets in mini yeast rolls'
      },
      {
        id: 'chickfila-egg-white-grill',
        name: 'Egg White Grill',
        category: 'Breakfast',
        image: chickfilaEggWhiteGrill,
        description: 'Grilled chicken with egg whites on an English muffin'
      },
      {
        id: 'chickfila-hash-brown-scramble-burrito',
        name: 'Hash Brown Scramble Burrito',
        category: 'Breakfast',
        image: chickfilaHashBrownScrambleBurrito,
        description: 'Scrambled eggs, hash browns, and cheese in a tortilla'
      },
      {
        id: 'chickfila-hash-brown-scramble-bowl',
        name: 'Hash Brown Scramble Bowl',
        category: 'Breakfast',
        image: chickfilaHashBrownScrambleBowl,
        description: 'Scrambled eggs, hash browns, and cheese in a bowl'
      },
      {
        id: 'chickfila-chicken-egg-cheese-biscuit',
        name: 'Chicken, Egg & Cheese Biscuit',
        category: 'Breakfast',
        image: chickfilaChickenEggCheeseBiscuit,
        description: 'Chicken filet, egg, and cheese on a buttermilk biscuit'
      },
      {
        id: 'chickfila-bacon-egg-cheese-biscuit',
        name: 'Bacon, Egg & Cheese Biscuit',
        category: 'Breakfast',
        image: chickfilaBaconEggCheeseBiscuit,
        description: 'Bacon, egg, and cheese on a buttermilk biscuit'
      },
      {
        id: 'chickfila-sausage-egg-cheese-biscuit',
        name: 'Sausage, Egg & Cheese Biscuit',
        category: 'Breakfast',
        image: chickfilaSausageEggCheeseBiscuit,
        description: 'Sausage, egg, and cheese on a buttermilk biscuit'
      },
      {
        id: 'chickfila-chicken-egg-cheese-muffin',
        name: 'Chicken, Egg & Cheese Muffin',
        category: 'Breakfast',
        image: chickfilaChickenEggCheeseMuffin,
        description: 'Chicken filet, egg, and cheese on an English muffin'
      },
      {
        id: 'chickfila-bacon-egg-cheese-muffin',
        name: 'Bacon, Egg & Cheese Muffin',
        category: 'Breakfast',
        image: chickfilaBaconEggCheeseMuffin,
        description: 'Bacon, egg, and cheese on an English muffin'
      },
      {
        id: 'chickfila-sausage-egg-cheese-muffin',
        name: 'Sausage, Egg & Cheese Muffin',
        category: 'Breakfast',
        image: chickfilaSausageEggCheeseMuffin,
        description: 'Sausage, egg, and cheese on an English muffin'
      },
      {
        id: 'chickfila-hash-browns',
        name: 'Hash Browns',
        category: 'Breakfast',
        image: chickfilaHashBrowns,
        description: 'Crispy hash brown potatoes'
      },
      {
        id: 'chickfila-berry-parfait',
        name: 'Berry Parfait',
        category: 'Breakfast',
        image: chickfilaBerryParfait,
        description: 'Yogurt parfait with berries and granola'
      },
      {
        id: 'chickfila-fruit-cup',
        name: 'Fruit Cup',
        category: 'Breakfast',
        image: chickfilaFruitCup,
        description: 'Fresh fruit medley'
      },
      {
        id: 'chickfila-waffle-fries',
        name: 'Waffle Potato Fries',
        category: 'Sides',
        image: chickfilaWaffleFries,
        description: 'Classic waffle-cut potato fries'
      },
      {
        id: 'chickfila-fruit-cup-side',
        name: 'Fruit Cup',
        category: 'Sides',
        image: chickfilaFruitCupSide,
        description: 'Fresh fruit medley'
      },
      {
        id: 'chickfila-side-salad',
        name: 'Side Salad',
        category: 'Sides',
        image: chickfilaSideSalad,
        description: 'Fresh mixed greens side salad'
      },
      {
        id: 'chickfila-mac-cheese',
        name: 'Mac & Cheese',
        category: 'Sides',
        image: chickfilaMacCheese,
        description: 'Creamy macaroni and cheese'
      },
      {
        id: 'chickfila-chicken-noodle-soup',
        name: 'Chicken Noodle Soup',
        category: 'Sides',
        image: chickfilaChickenNoodleSoup,
        description: 'Hearty chicken noodle soup'
      },
      {
        id: 'chickfila-chicken-tortilla-soup',
        name: 'Chicken Tortilla Soup',
        category: 'Sides',
        image: chickfilaChickenTortillaSoup,
        description: 'Spicy chicken tortilla soup'
      },
      {
        id: 'chickfila-waffle-chips',
        name: 'Original Waffle Potato Chips',
        category: 'Sides',
        image: chickfilaWaffleChips,
        description: 'Waffle potato chips with sea salt'
      },
      {
        id: 'chickfila-sauce-waffle-chips',
        name: 'Chick-fil-A Sauce Waffle Chips',
        category: 'Sides',
        image: chickfilaSauceWaffleChips,
        description: 'Waffle chips with Chick-fil-A sauce flavor'
      },
      {
        id: 'chickfila-apple-sauce',
        name: 'Buddy Fruits Apple Sauce',
        category: 'Sides',
        image: chickfilaAppleSauce,
        description: 'Apple & cinnamon fruit sauce'
      },
      {
        id: 'chickfila-kale-crunch',
        name: 'Kale Crunch Side',
        category: 'Sides',
        image: chickfilaKaleCrunch,
        description: 'Fresh kale crunch side'
      },
      {
        id: 'chickfila-berry-parfait-side',
        name: 'Berry Parfait',
        category: 'Sides',
        image: chickfilaBerryParfaitSide,
        description: 'Yogurt parfait with berries and granola'
      },
      {
        id: 'chickfila-cherry-berry-frosted-lemonade',
        name: 'Cherry Berry Frosted Lemonade',
        category: 'Treats',
        image: chickfilaCherryBerryFrostedLemonade,
        description: 'Frozen cherry and berry lemonade treat'
      },
      {
        id: 'chickfila-frosted-lemonade',
        name: 'Frosted Lemonade',
        category: 'Treats',
        image: chickfilaFrostedLemonade,
        description: 'Frozen lemonade with Icedream'
      },
      {
        id: 'chickfila-frosted-coffee',
        name: 'Frosted Coffee',
        category: 'Treats',
        image: chickfilaFrostedCoffee,
        description: 'THRIVE Farmers coffee blended with Icedream'
      },
      {
        id: 'chickfila-vanilla-milkshake',
        name: 'Vanilla Milkshake',
        category: 'Treats',
        image: chickfilaVanillaMilkshake,
        description: 'Classic vanilla milkshake'
      },
      {
        id: 'chickfila-cookies-cream-milkshake',
        name: 'Cookies & Cream Milkshake',
        category: 'Treats',
        image: chickfilaCookiesCreamMilkshake,
        description: 'Milkshake with cookies and cream'
      },
      {
        id: 'chickfila-chocolate-milkshake',
        name: 'Chocolate Milkshake',
        category: 'Treats',
        image: chickfilaChocolateMilkshake,
        description: 'Rich chocolate milkshake'
      },
      {
        id: 'chickfila-strawberry-milkshake',
        name: 'Strawberry Milkshake',
        category: 'Treats',
        image: chickfilaStrawberryMilkshake,
        description: 'Fresh strawberry milkshake'
      },
      {
        id: 'chickfila-icedream-cup',
        name: 'Icedream Cup',
        category: 'Treats',
        image: chickfilaIcedreamCup,
        description: 'Soft-serve Icedream in a cup'
      },
      {
        id: 'chickfila-icedream-cone',
        name: 'Icedream Cone',
        category: 'Treats',
        image: chickfilaIcedreamCone,
        description: 'Soft-serve Icedream in a cone'
      },
      {
        id: 'chickfila-chocolate-chunk-cookie',
        name: 'Chocolate Chunk Cookie',
        category: 'Treats',
        image: chickfilaChocolateChunkCookie,
        description: 'Freshly baked chocolate chunk cookie'
      },
      {
        id: 'chickfila-chocolate-fudge-brownie',
        name: 'Chocolate Fudge Brownie',
        category: 'Treats',
        image: chickfilaChocolateFudgeBrownie,
        description: 'Rich and fudgy chocolate brownie'
      },
      {
        id: 'chickfila-barbeque-sauce',
        name: 'Barbeque Sauce',
        category: 'Dipping Sauces',
        image: chickfilaBarbequeSauce,
        description: 'Sweet and tangy BBQ dipping sauce'
      },
      {
        id: 'chickfila-signature-sauce',
        name: 'Chick-fil-A Sauce',
        category: 'Dipping Sauces',
        image: chickfilaSignatureSauce,
        description: 'Our signature sauce - a must-try!'
      },
      {
        id: 'chickfila-garden-herb-ranch',
        name: 'Garden Herb Ranch Sauce',
        category: 'Dipping Sauces',
        image: chickfilaGardenHerbRanch,
        description: 'Creamy ranch with garden herbs'
      },
      {
        id: 'chickfila-honey-mustard',
        name: 'Honey Mustard Sauce',
        category: 'Dipping Sauces',
        image: chickfilaHoneyMustard,
        description: 'Sweet honey mustard blend'
      },
      {
        id: 'chickfila-polynesian-sauce',
        name: 'Polynesian Sauce',
        category: 'Dipping Sauces',
        image: chickfilaPolynesianSauce,
        description: 'Sweet and bold sauce with Pacific flair'
      },
      {
        id: 'chickfila-sriracha-sauce',
        name: 'Sweet & Spicy Sriracha Sauce',
        category: 'Dipping Sauces',
        image: chickfilaSrirachaSauce,
        description: 'Sweet heat with sriracha kick'
      },
      {
        id: 'chickfila-honey-roasted-bbq',
        name: 'Honey Roasted BBQ Sauce',
        category: 'Dipping Sauces',
        image: chickfilaHoneyRoastedBBQ,
        description: 'Sweet honey-roasted BBQ flavor'
      },
      {
        id: 'chickfila-zesty-buffalo',
        name: 'Zesty Buffalo Sauce',
        category: 'Dipping Sauces',
        image: chickfilaZestyBuffalo,
        description: 'Zesty buffalo sauce with a kick'
      }
    ]
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
    longitude: -77.0380,
    menu: [
      {
        id: 'coupe-latte',
        name: 'Latté',
        price: 5.25,
        category: 'Coffee & Beverages',
        description: 'One Part Espresso, Four Parts Milk Foam',
        image: coupeLatte
      },
      {
        id: 'coupe-iced-latte',
        name: 'Iced Latte',
        price: 5.50,
        category: 'Coffee & Beverages',
        description: 'One Part Espresso, Four Parts Milk',
        image: coupeIcedLatte
      },
      {
        id: 'coupe-burger',
        name: 'The Coupe Burger',
        price: 16.00,
        category: 'Burgers & Sandwiches',
        description: '8oz Angus beef patty, cheddar cheese, garlic aioli, lettuce, tomato, pickle, red onion, served with fries',
        image: coupeBurger
      },
      {
        id: 'coupe-breakfast-burrito',
        name: 'Breakfast Burrito',
        price: 15.00,
        category: 'Breakfast All Day',
        description: 'Scrambled eggs, pork chorizo, shredded potatoes, cheddar, ranchero sauce and cilantro crema in a flour tortilla',
        image: coupeBreakfastBurrito
      },
      {
        id: 'coupe-avocado-toast',
        name: 'Avocado Toast',
        price: 15.00,
        category: 'Breakfast All Day',
        description: 'Mashed avocado, hard-boiled egg, feta, pickled red onion and everything bagel seasoning on thick cut sourdough',
        image: coupeAvocadoToast
      },
      {
        id: 'coupe-pancakes',
        name: 'Buttermilk Pancakes',
        price: 11.00,
        category: 'Breakfast All Day',
        description: 'Served with syrup, butter and powdered sugar',
        image: coupePancakes
      },
      {
        id: 'coupe-huevos-rancheros',
        name: 'Huevos Rancheros',
        price: 16.00,
        category: 'Breakfast All Day',
        description: 'Corn tortillas, black bean-chorizo mix, rancheros sauce, two sunny side up eggs, topped with queso fresco, avocado and cilantro',
        image: coupeHuevosRancheros
      },
      {
        id: 'coupe-french-toast',
        name: 'Stuffed French Toast',
        price: 13.00,
        category: 'Breakfast All Day',
        description: 'Filled with strawberries, citrus cream cheese and blueberry sauce',
        image: coupeFrenchToast
      },
      {
        id: 'coupe-chicken-waffle',
        name: 'Fried Chicken & Waffle',
        price: 17.00,
        category: 'Breakfast All Day',
        description: 'Chicken thigh, bacon-bourbon syrup and herb chive butter',
        image: coupeChickenWaffle
      },
      {
        id: 'coupe-yogurt-parfait',
        name: 'Yogurt Parfait',
        price: 10.00,
        category: 'Breakfast All Day',
        description: 'Yogurt, fresh berries, banana and housemade granola',
        image: coupeYogurtParfait
      },
      {
        id: 'coupe-eggs-benedict',
        name: 'Eggs Benedict',
        price: 16.00,
        category: 'Breakfast All Day',
        description: 'Available Saturday & Sunday 8am-3pm - Two poached eggs, ham, hollandaise on an English muffin served with a hashbrown square or grits'
      },
      {
        id: 'coupe-caesar',
        name: 'Classic Caesar',
        price: 13.00,
        category: 'Salads & Soups',
        description: 'Romaine lettuce, parmesan cheese, garlic croutons with a Caesar dressing',
        image: coupeCaesarSalad
      },
      {
        id: 'coupe-bowl',
        name: 'The Coupe Bowl',
        price: 14.00,
        category: 'Salads & Soups',
        description: 'Curried chickpeas, roasted sweet potatoes, pickled red onion, arugula and avocado with a creamy cashew dressing',
        image: coupeBowl
      },
      {
        id: 'coupe-classic-cobb',
        name: 'Classic Cobb',
        price: 17.00,
        category: 'Salads & Soups',
        description: 'Grilled chicken, cucumber, cherry tomatoes, bacon, avocado, romaine lettuce, hard boiled egg, with a blue cheese dressing',
        image: coupeClassicCobb
      },
      {
        id: 'coupe-wings',
        name: 'House Wings',
        price: 18.00,
        category: 'Starters',
        description: '6 or 12 sriracha-glazed wings served with ranch or blue cheese',
        image: coupeWings
      },
      {
        id: 'coupe-fish-tacos',
        name: 'Fish Tacos',
        price: 10.00,
        category: 'Starters',
        description: 'Blackened whiting, pineapple salsa and lime crema in corn tortillas'
      },
      {
        id: 'coupe-fries',
        name: 'Coupe Fries',
        price: 14.00,
        category: 'Starters',
        description: 'Short rib, cheese curds and pickled jalapeños smothered in brown gravy',
        image: coupeFries
      },
      {
        id: 'coupe-falafel',
        name: 'Falafel Pita',
        price: 16.00,
        category: 'Burgers & Sandwiches',
        description: 'Mixed greens, cucumber, pickled red onion, cherry tomatoes and cashew tzatziki wrapped in pita bread, served with fries'
      },
      {
        id: 'coupe-turkey-brie',
        name: 'Turkey & Brie Sandwich',
        price: 15.00,
        category: 'Burgers & Sandwiches',
        description: 'Roasted turkey breast, green apple, brie cheese, cranberry mayo on wheat bread, served with fries'
      },
      {
        id: 'coupe-salmon-burger',
        name: 'Salmon Burger',
        price: 18.00,
        category: 'Burgers & Sandwiches',
        description: 'Housemade salmon patty served with a cucumber-radish dill slaw, garlic aioli and fries'
      },
      {
        id: 'coupe-steak-frites',
        name: 'Steak Frites',
        price: 26.00,
        category: 'Entrees',
        description: '10oz rib eye and side of brown gravy, served with parmesan-truffle fries and mixed greens salad',
        image: coupeSteakFrites
      },
      {
        id: 'coupe-grilled-salmon',
        name: 'Grilled Salmon',
        price: 26.00,
        category: 'Entrees',
        description: 'Served with roasted red potatoes, green beans and a butter sauce'
      },
      {
        id: 'coupe-fish-chips',
        name: 'Fish & Chips',
        price: 18.00,
        category: 'Entrees',
        description: 'Beer battered whiting served with french fries, tartar sauce and malt vinegar'
      },
      {
        id: 'coupe-mac-cheese',
        name: 'Chicken Mac n\' Cheese',
        price: 18.00,
        category: 'Entrees',
        description: 'Big bowl of our house mac n\' cheese topped with a grilled chicken breast and panko breadcrumbs'
      },
      {
        id: 'coupe-rice-bowl',
        name: 'Build-Your-Own Rice Bowl',
        price: 7.00,
        category: 'Build-Your-Own',
        description: 'Start with white rice, white rice & mixed greens, or mixed greens. Add protein, veggies, cheese and sauce'
      }
    ]
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