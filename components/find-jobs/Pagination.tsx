'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

const RESULTS_PER_PAGE = 20

interface PaginationProps {
  total: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages: (number | '...')[] = [1]
  if (currentPage > 3) pages.push('...')
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    pages.push(i)
  }
  if (currentPage < totalPages - 2) pages.push('...')
  pages.push(totalPages)
  return pages
}

export function Pagination({ total, currentPage, totalPages, onPageChange }: PaginationProps) {
  const startResult = total === 0 ? 0 : (currentPage - 1) * RESULTS_PER_PAGE + 1
  const endResult = Math.min(currentPage * RESULTS_PER_PAGE, total)
  const pageItems = getPageNumbers(currentPage, totalPages)

  return (
    <div className="max-w-360 mx-auto px-6 pb-8">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        {/* Results count */}
        <div className="text-sm text-text-secondary">
          {total === 0
            ? 'No results'
            : `Showing ${startResult} to ${endResult} of ${total} results`}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pageItems.map((item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-text-muted">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => onPageChange(item)}
                  className={`min-w-8 rounded-md px-3 py-2 text-sm font-medium ${
                    item === currentPage
                      ? 'bg-accent text-accent-foreground'
                      : 'border border-border bg-surface text-text-primary hover:bg-surface-secondary'
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </div>

          {/* Next button */}
          <button
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
