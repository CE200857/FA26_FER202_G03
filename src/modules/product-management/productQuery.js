export const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'name-asc', label: 'Tên A → Z' },
  { value: 'name-desc', label: 'Tên Z → A' },
  { value: 'price-asc', label: 'Giá thấp đến cao' },
  { value: 'price-desc', label: 'Giá cao đến thấp' },
];

export const DEFAULT_SORT = 'newest';

/** Lowercase and strip Vietnamese accents so "dau goi" matches "Dầu gội". */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/** '' or invalid or negative input -> null, otherwise a number. */
export function parsePrice(value) {
  if (value === '' || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

/** Sorted unique values of a product field, e.g. getOptions(products, 'brand'). */
export function getOptions(products, field) {
  return [...new Set(products.map((product) => product[field]).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'vi'),
  );
}

function matchesSearch(product, tokens) {
  if (tokens.length === 0) return true;
  const haystack = `${normalizeText(product.name)} ${normalizeText(product.id)}`;
  return tokens.every((token) => haystack.includes(token));
}

const timeOf = (product) => {
  const time = Date.parse(product.createdAt);
  return Number.isNaN(time) ? 0 : time;
};
const byName = (a, b) => String(a.name).localeCompare(String(b.name), 'vi');

const COMPARATORS = {
  newest: (a, b) => timeOf(b) - timeOf(a),
  oldest: (a, b) => timeOf(a) - timeOf(b),
  'name-asc': byName,
  'name-desc': (a, b) => byName(b, a),
  'price-asc': (a, b) => Number(a.price) - Number(b.price),
  'price-desc': (a, b) => Number(b.price) - Number(a.price),
};

/**
 * Search (name or product code), filter (category, brand, price range) and sort.
 * Returns a new array; the input is never mutated.
 */
export function applyCatalogQuery(
  products,
  { query = '', category = '', brand = '', minPrice = null, maxPrice = null, sort = DEFAULT_SORT } = {},
) {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  const compare = COMPARATORS[sort] ?? COMPARATORS[DEFAULT_SORT];

  return products
    .filter((product) => matchesSearch(product, tokens))
    .filter((product) => !category || product.category === category)
    .filter((product) => !brand || product.brand === brand)
    .filter((product) => minPrice === null || Number(product.price) >= minPrice)
    .filter((product) => maxPrice === null || Number(product.price) <= maxPrice)
    .sort((a, b) => compare(a, b) || String(a.id).localeCompare(String(b.id)));
}