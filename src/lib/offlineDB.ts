import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  restaurants: {
    key: string;
    value: {
      id: string;
      data: any;
      lastUpdated: number;
    };
  };
  orders: {
    key: string;
    value: {
      id: string;
      data: any;
      synced: boolean;
      lastUpdated: number;
    };
  };
  preferences: {
    key: string;
    value: {
      key: string;
      value: any;
      lastUpdated: number;
    };
  };
  likedRestaurants: {
    key: string;
    value: {
      id: string;
      data: any;
      lastUpdated: number;
    };
  };
}

const DB_NAME = 'SwipeNBite';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

export const getDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Restaurants store
        if (!db.objectStoreNames.contains('restaurants')) {
          db.createObjectStore('restaurants', { keyPath: 'id' });
        }
        
        // Orders store
        if (!db.objectStoreNames.contains('orders')) {
          db.createObjectStore('orders', { keyPath: 'id' });
        }
        
        // Preferences store
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'key' });
        }
        
        // Liked restaurants store
        if (!db.objectStoreNames.contains('likedRestaurants')) {
          db.createObjectStore('likedRestaurants', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

// Restaurant operations
export const cacheRestaurants = async (restaurants: any[]) => {
  const db = await getDB();
  const tx = db.transaction('restaurants', 'readwrite');
  const timestamp = Date.now();
  
  await Promise.all([
    ...restaurants.map(restaurant => 
      tx.store.put({
        id: restaurant.id,
        data: restaurant,
        lastUpdated: timestamp
      })
    ),
    tx.done
  ]);
};

export const getCachedRestaurants = async () => {
  const db = await getDB();
  const items = await db.getAll('restaurants');
  return items.map(item => item.data);
};

export const getCachedRestaurant = async (id: string) => {
  const db = await getDB();
  const item = await db.get('restaurants', id);
  return item?.data;
};

// Order operations
export const cacheOrder = async (order: any, synced: boolean = true) => {
  const db = await getDB();
  await db.put('orders', {
    id: order.id,
    data: order,
    synced,
    lastUpdated: Date.now()
  });
};

export const getCachedOrders = async () => {
  const db = await getDB();
  const items = await db.getAll('orders');
  return items.map(item => item.data);
};

export const getUnsyncedOrders = async () => {
  const db = await getDB();
  const allOrders = await db.getAll('orders');
  const unsyncedOrders = allOrders.filter(item => !item.synced);
  return unsyncedOrders.map(item => item.data);
};

export const markOrderSynced = async (orderId: string) => {
  const db = await getDB();
  const order = await db.get('orders', orderId);
  if (order) {
    order.synced = true;
    await db.put('orders', order);
  }
};

// Preferences operations
export const cachePreference = async (key: string, value: any) => {
  const db = await getDB();
  await db.put('preferences', {
    key,
    value,
    lastUpdated: Date.now()
  });
};

export const getCachedPreference = async (key: string) => {
  const db = await getDB();
  const item = await db.get('preferences', key);
  return item?.value;
};

export const getAllPreferences = async () => {
  const db = await getDB();
  const items = await db.getAll('preferences');
  return items.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, any>);
};

// Liked restaurants operations
export const cacheLikedRestaurant = async (restaurant: any) => {
  const db = await getDB();
  await db.put('likedRestaurants', {
    id: restaurant.id,
    data: restaurant,
    lastUpdated: Date.now()
  });
};

// Cache multiple liked restaurants at once for better performance
export const cacheLikedRestaurantsBatch = async (restaurants: any[]) => {
  const db = await getDB();
  const tx = db.transaction('likedRestaurants', 'readwrite');
  const timestamp = Date.now();
  
  await Promise.all([
    ...restaurants.map(restaurant => 
      tx.store.put({
        id: restaurant.restaurant_id || restaurant.id,
        data: restaurant,
        lastUpdated: timestamp
      })
    ),
    tx.done
  ]);
};

export const getCachedLikedRestaurants = async () => {
  const db = await getDB();
  const items = await db.getAll('likedRestaurants');
  return items.map(item => item.data);
};

export const removeCachedLikedRestaurant = async (id: string) => {
  const db = await getDB();
  await db.delete('likedRestaurants', id);
};

// Clear all data
export const clearAllCache = async () => {
  const db = await getDB();
  await Promise.all([
    db.clear('restaurants'),
    db.clear('orders'),
    db.clear('preferences'),
    db.clear('likedRestaurants')
  ]);
};
