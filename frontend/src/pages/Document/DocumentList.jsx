import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';
  const initialMajor = searchParams.get('major') || '';

  const [selectedMajors, setSelectedMajors] = useState(() => (initialMajor ? [initialMajor] : []));
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [sortValue, setSortValue] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    if (initialMajor) {
      setSelectedMajors((prev) => (prev.includes(initialMajor) ? prev : [...prev, initialMajor]));
    }
  }, [initialMajor]);

  const normalizeStr = (s) => (s ? s.toLowerCase().replace(/[\s-_]+/g, '') : '');

  const searchQuery = initialSearch.trim().toLowerCase();

  const filteredDocuments = MOCK_DOCUMENTS.filter((doc) => {
    // 1. Search Query condition (AND with all filters)
    if (searchQuery) {
      const titleMatch = doc.title?.toLowerCase().includes(searchQuery);
      const subjectMatch = doc.subject?.toLowerCase().includes(searchQuery);
      const majorMatch = doc.major?.toLowerCase().includes(searchQuery);
      const descMatch = doc.description?.toLowerCase().includes(searchQuery);

      if (!titleMatch && !subjectMatch && !majorMatch && !descMatch) {
        return false;
      }
    }

    // 2. Major filter (OR within group)
    if (selectedMajors.length > 0) {
      const matchesMajor = selectedMajors.some((selected) => {
        const normSelected = normalizeStr(selected);
        const normDocMajor = normalizeStr(doc.major);
        const normDocSlug = normalizeStr(doc.majorSlug);
        return normDocMajor === normSelected || normDocSlug === normSelected;
      });
      if (!matchesMajor) return false;
    }

    // 3. Document Type filter (OR within group)
    if (selectedTypes.length > 0) {
      const matchesType = selectedTypes.some((type) => {
        if (type === 'Other') {
          return !['PDF', 'Slides', 'Notes'].includes(doc.fileType);
        }
        return doc.fileType?.toLowerCase() === type.toLowerCase();
      });
      if (!matchesType) return false;
    }

    // 4. Subject filter (OR within group)
    if (selectedSubjects.length > 0) {
      const matchesSubject = selectedSubjects.some((subj) => {
        if (!doc.subject) return false;
        const normSubj = normalizeStr(subj);
        const normDocSubj = normalizeStr(doc.subject);
        return normDocSubj.includes(normSubj) || normSubj.includes(normDocSubj);
      });
      if (!matchesSubject) return false;
    }

    return true;
  });

  const handleFilterChange = ({ majors, types, subjects }) => {
    if (majors !== undefined) setSelectedMajors(majors);
    if (types !== undefined) setSelectedTypes(types);
    if (subjects !== undefined) setSelectedSubjects(subjects);
  };

  const handleClearFilters = () => {
    setSelectedMajors([]);
    setSelectedTypes([]);
    setSelectedSubjects([]);
    if (initialMajor) {
      const searchParam = initialSearch ? `?search=${encodeURIComponent(initialSearch)}` : '';
      navigate(`/documents${searchParam}`);
    }
  };

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
            Showing <strong>{filteredDocuments.length}</strong> study documents
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
              selectedMajors={selectedMajors}
              selectedTypes={selectedTypes}
              selectedSubjects={selectedSubjects}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <main className="grid-main-wrapper">
            <DocumentGrid documents={filteredDocuments} emptyMessage="No documents found" />
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

