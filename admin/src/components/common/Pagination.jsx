import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="pg-container">
      <button
        type="button"
        className="pg-btn"
        disabled={page <= 1 || disabled}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} /> Previous
      </button>
      
      <span className="pg-label">
        Page <strong>{page}</strong> of {totalPages}
      </span>
      
      <button
        type="button"
        className="pg-btn"
        disabled={page >= totalPages || disabled}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}