import './Pagination.css';

// Always show the first, last and current pages (plus neighbours); fill gaps with "…".
function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push(`gap-${page}`);
    items.push(page);
  });
  return items;
}

/**
 * Generic page switcher. Renders nothing when there is only one page.
 * Props: currentPage (1-based), totalPages, onPageChange(page).
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const goTo = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="pagination__btn"
        aria-label="Trang trước"
        disabled={currentPage === 1}
        onClick={() => goTo(currentPage - 1)}
      >
        ‹
      </button>

      {getPageItems(currentPage, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={`pagination__btn${item === currentPage ? ' is-active' : ''}`}
            aria-label={`Trang ${item}`}
            aria-current={item === currentPage ? 'page' : undefined}
            onClick={() => goTo(item)}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className="pagination__btn"
        aria-label="Trang sau"
        disabled={currentPage === totalPages}
        onClick={() => goTo(currentPage + 1)}
      >
        ›
      </button>
    </nav>
  );
}