import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DocumentGrid from '../../components/document/DocumentGrid';
import DocumentFilter from '../../components/document/DocumentFilter';
import Pagination from '../../components/common/Pagination';
import { MOCK_DOCUMENTS } from '../../mock/documents';
import { SORT_OPTIONS } from '../../utils/constants';
import './DocumentList.css';

export const DocumentList = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialMajor = searchParams.get('major') || '';

  const [sortValue, setSortValue] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredDocs, setFilteredDocs] = useState(MOCK_DOCUMENTS);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  return (
    <div className="payt-document-list-page">
      {/* Top Banner / Search Header */}
      <div className="doc-list-banner sunrise-bg-soft">
        <div className="container">
          <h1 className="banner-title">Documents Archive</h1>
          <p className="banner-subtitle">
            Browse verified lecture notes, exam prep, and study guides from top universities.
          </p>
          <div className="banner-search-box">
            <SearchBar size="md" initialValue={initialSearch} placeholder="Filter by title, topic, major..." />
          </div>
        </div>
      </div>

      {/* Main Content Layout (Sidebar + Grid) */}
      <div className="container doc-list-container">
        {/* Toolbar Header (Results Count + Mobile Filter Toggle + Sort) */}
        <div className="doc-list-toolbar">
          <div className="results-count">
            Showing <strong>{filteredDocs.length}</strong> study documents
          </div>

          <div className="toolbar-controls">
            <button
              className="mobile-filter-toggle-btn payt-btn payt-btn-secondary"
              onClick={() => setShowMobileFilter(!showMobileFilter)}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            <div className="sort-dropdown-wrap">
              <span className="sort-label">Sort by:</span>
              <Select
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={(e) => setSortValue(e.target.value)}
                placeholder={null}
              />
            </div>
          </div>
        </div>

        {/* Grid & Sidebar Content */}
        <div className="doc-list-layout">
          <aside className={`filter-sidebar-wrapper ${showMobileFilter ? 'mobile-visible' : ''}`}>
            <DocumentFilter
              selectedMajors={initialMajor ? [initialMajor] : []}
              onFilterChange={(filters) => console.log('Filters changed:', filters)}
              onClearFilters={() => console.log('Cleared filters')}
            />
          </aside>

          <main className="grid-main-wrapper">
            <DocumentGrid documents={filteredDocs} />
            <Pagination
              currentPage={currentPage}
              totalPages={3}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;
