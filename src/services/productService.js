import { initialProducts } from '../data/mockData';
import { STORAGE_KEYS, storageService } from './storageService';

const FAKE_LATENCY_MS = 250;

const wait = (ms = FAKE_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms));

function readAll() {
  // App.jsx seeds the mock database in a useEffect, but child effects run
  // before parent effects, so seed here too (it only writes if the key is empty).
  storageService.initSeedData({ [STORAGE_KEYS.PRODUCTS]: initialProducts });
  return storageService.get(STORAGE_KEYS.PRODUCTS, []);
}

/**
 * Returns all products. Hidden products (isHidden: true, same convention as
 * reviews) are left out unless includeHidden is true (admin pages).
 */
export async function getProducts({ includeHidden = false } = {}) {
  await wait();
  const all = readAll();
  return includeHidden ? all : all.filter((product) => !product.isHidden);
}

/** Returns one product by id (e.g. 'P001'), or null if it does not exist. */
export async function getProductById(id) {
  await wait();
  return readAll().find((product) => String(product.id) === String(id)) ?? null;
}