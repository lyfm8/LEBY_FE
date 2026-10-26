import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button 
        className="page-btn"
        disabled={currentPage === 0} 
        onClick={() => onPageChange(currentPage - 1)}
      >
        Trước
      </button>
      
      {[...Array(totalPages)].map((_, i) => (
        <button
          key={i}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i + 1}
        </button>
      ))}

      <button 
        className="page-btn"
        disabled={currentPage === totalPages - 1} 
        onClick={() => onPageChange(currentPage + 1)}
      >
        Sau
      </button>
    </div>
  );
};
