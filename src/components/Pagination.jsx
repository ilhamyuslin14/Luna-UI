export default function Pagination({ page = 1, total = 3, perPage = 10, onPageChange, onPerPageChange }) {
  return (
    <div className="pg-pagination">
      <div className="pg-per-page">
        <span>Tampilkan</span>
        <select
          className="pg-per-page-select"
          value={perPage}
          onChange={e => onPerPageChange?.(Number(e.target.value))}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>data</span>
      </div>
      <div className="pg-page-container">
        <div className="pg-page-box">{page}</div>
        <span className="pg-page-text">dari {total}</span>
        <div className="pg-page-controls">
          <button className="pg-page-btn pg-page-btn-prev" onClick={() => onPageChange?.(page - 1)} disabled={page <= 1}>
            <img src="/assets/line244.svg" alt="Prev" />
          </button>
          <div className="pg-page-btn-divider"></div>
          <button className="pg-page-btn pg-page-btn-next" onClick={() => onPageChange?.(page + 1)} disabled={page >= total}>
            <img src="/assets/line242.svg" alt="Next" />
          </button>
        </div>
      </div>
    </div>
  );
}
