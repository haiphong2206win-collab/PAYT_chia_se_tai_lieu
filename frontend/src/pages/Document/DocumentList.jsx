import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';

import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DocumentGrid from '../../components/document/DocumentGrid';
import DocumentFilter from '../../components/document/DocumentFilter';
import Pagination from '../../components/common/Pagination';

import { MOCK_DOCUMENTS } from '../../mock/documents';
import { getDocumentsApi } from '../../services/document.api';
import { SORT_OPTIONS } from '../../utils/constants';

import './DocumentList.css';

const ITEMS_PER_PAGE = 6;

export const DocumentList = () => {
  // =====================================================
  // 1. BACKEND DOCUMENT DATA
  // =====================================================

  const [backendDocuments, setBackendDocuments] = useState([]);

  // Khi trang /documents được mở -> gọi Backend
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await getDocumentsApi();

        console.log('Documents from Backend:', response);

        setBackendDocuments(response.documents || []);
      } catch (error) {
        console.error('Get documents error:', error);
      }
    };

    fetchDocuments();
  }, []);

  // Tạm thời dùng biến này để kiểm tra dữ liệu Backend đã vào state hay chưa


  // =====================================================
  // 2. URL SEARCH PARAMS
  // =====================================================

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSearch = searchParams.get('search') || '';
  const initialMajor = searchParams.get('major') || '';

  // =====================================================
  // 3. FILTER STATES
  // =====================================================

  const [selectedMajors, setSelectedMajors] = useState(() =>
    initialMajor ? [initialMajor] : []
  );

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  // =====================================================
  // 4. SORT / PAGINATION / MOBILE FILTER STATES
  // =====================================================

  const [sortValue, setSortValue] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // =====================================================
  // 5. INITIAL MAJOR FROM URL
  // =====================================================

  useEffect(() => {
    if (initialMajor) {
      setSelectedMajors((prev) =>
        prev.includes(initialMajor)
          ? prev
          : [...prev, initialMajor]
      );
    }
  }, [initialMajor]);

  // =====================================================
  // 6. SEARCH HELPERS
  // =====================================================

  const normalizeStr = (s) =>
    s
      ? s.toLowerCase().replace(/[\s-_]+/g, '')
      : '';

  const searchQuery = initialSearch.trim().toLowerCase();

  // =====================================================
  // 7. RESET PAGE WHEN SEARCH / FILTER / SORT CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedMajors,
    selectedTypes,
    selectedSubjects,
    sortValue,
  ]);

  // =====================================================
  // 8. MOCK LOADING STATE
  // =====================================================

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [
    searchQuery,
    selectedMajors,
    selectedTypes,
    selectedSubjects,
    sortValue,
    currentPage,
  ]);

  // =====================================================
  // 9. FILTER
  // =====================================================
  //
  // QUAN TRỌNG:
  // Hiện tại vẫn dùng MOCK_DOCUMENTS.
  //
  // Chưa đổi sang backendDocuments vì cần kiểm tra
  // cấu trúc field Backend trước.
  //
  // Sau này:
  //
  // MOCK_DOCUMENTS.filter(...)
  //
  // sẽ được thay bằng dữ liệu Backend.
  // =====================================================

  const filteredDocuments = MOCK_DOCUMENTS.filter((doc) => {
    // Search
    if (searchQuery) {
      const titleMatch = doc.title
        ?.toLowerCase()
        .includes(searchQuery);

      const subjectMatch = doc.subject
        ?.toLowerCase()
        .includes(searchQuery);

      const majorMatch = doc.major
        ?.toLowerCase()
        .includes(searchQuery);

      const descMatch = doc.description
        ?.toLowerCase()
        .includes(searchQuery);

      if (
        !titleMatch &&
        !subjectMatch &&
        !majorMatch &&
        !descMatch
      ) {
        return false;
      }
    }

    // Major Filter
    if (selectedMajors.length > 0) {
      const matchesMajor = selectedMajors.some((selected) => {
        const normSelected = normalizeStr(selected);
        const normDocMajor = normalizeStr(doc.major);
        const normDocSlug = normalizeStr(doc.majorSlug);

        return (
          normDocMajor === normSelected ||
          normDocSlug === normSelected
        );
      });

      if (!matchesMajor) {
        return false;
      }
    }

    // Document Type Filter
    if (selectedTypes.length > 0) {
      const matchesType = selectedTypes.some((type) => {
        if (type === 'Other') {
          return !['PDF', 'Slides', 'Notes'].includes(
            doc.fileType
          );
        }

        return (
          doc.fileType?.toLowerCase() ===
          type.toLowerCase()
        );
      });

      if (!matchesType) {
        return false;
      }
    }

    // Subject Filter
    if (selectedSubjects.length > 0) {
      const matchesSubject = selectedSubjects.some((subj) => {
        if (!doc.subject) {
          return false;
        }

        const normSubj = normalizeStr(subj);
        const normDocSubj = normalizeStr(doc.subject);

        return (
          normDocSubj.includes(normSubj) ||
          normSubj.includes(normDocSubj)
        );
      });

      if (!matchesSubject) {
        return false;
      }
    }

    return true;
  });

  // =====================================================
  // 10. SORT
  // =====================================================

  const sortedDocuments = [...filteredDocuments].sort(
    (a, b) => {
      if (sortValue === 'popular') {
        return (
          (b.downloads || 0) -
          (a.downloads || 0)
        );
      }

      if (sortValue === 'rating') {
        return (
          (b.rating || 0) -
          (a.rating || 0)
        );
      }

      if (sortValue === 'newest') {
        const dateA = a.uploadDate
          ? new Date(a.uploadDate).getTime()
          : 0;

        const dateB = b.uploadDate
          ? new Date(b.uploadDate).getTime()
          : 0;

        return dateB - dateA;
      }

      return 0;
    }
  );

  // =====================================================
  // 11. PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    sortedDocuments.length / ITEMS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * ITEMS_PER_PAGE;

  const paginatedDocuments =
    sortedDocuments.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );

  // =====================================================
  // 12. FILTER HANDLERS
  // =====================================================

  const handleFilterChange = ({
    majors,
    types,
    subjects,
  }) => {
    if (majors !== undefined) {
      setSelectedMajors(majors);
    }

    if (types !== undefined) {
      setSelectedTypes(types);
    }

    if (subjects !== undefined) {
      setSelectedSubjects(subjects);
    }
  };

  const handleClearFilters = () => {
    setSelectedMajors([]);
    setSelectedTypes([]);
    setSelectedSubjects([]);

    if (initialMajor) {
      const searchParam = initialSearch
        ? `?search=${encodeURIComponent(initialSearch)}`
        : '';

      navigate(`/documents${searchParam}`);
    }
  };

  // =====================================================
  // 13. UI
  // =====================================================

  return (
    <div className="payt-document-list-page">

      {/* Top Banner */}
      <div className="doc-list-banner sunrise-bg-soft">
        <div className="container">

          <h1 className="banner-title">
            Documents Archive
          </h1>

          <p className="banner-subtitle">
            Browse verified lecture notes, exam prep,
            and study guides from top universities.
          </p>

          <div className="banner-search-box">
            <SearchBar
              size="md"
              initialValue={initialSearch}
              placeholder="Filter by title, topic, major..."
            />
          </div>

        </div>
      </div>

      {/* Main */}
      <div className="container doc-list-container">

        {/* Toolbar */}
        <div className="doc-list-toolbar">

          <div className="results-count">
            Showing{' '}
            <strong>
              {filteredDocuments.length}
            </strong>{' '}
            study documents
          </div>

          <div className="toolbar-controls">

            <button
              className="mobile-filter-toggle-btn payt-btn payt-btn-secondary"
              onClick={() =>
                setShowMobileFilter(
                  !showMobileFilter
                )
              }
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>

            <div className="sort-dropdown-wrap">

              <span className="sort-label">
                Sort by:
              </span>

              <Select
                options={SORT_OPTIONS}
                value={sortValue}
                onChange={(e) =>
                  setSortValue(e.target.value)
                }
                placeholder={null}
              />

            </div>

          </div>

        </div>

        {/* Sidebar + Documents */}
        <div className="doc-list-layout">

          <aside
            className={`filter-sidebar-wrapper ${showMobileFilter
              ? 'mobile-visible'
              : ''
              }`}
          >

            <DocumentFilter
              selectedMajors={selectedMajors}
              selectedTypes={selectedTypes}
              selectedSubjects={selectedSubjects}
              onFilterChange={
                handleFilterChange
              }
              onClearFilters={
                handleClearFilters
              }
            />

          </aside>

          <main className="grid-main-wrapper">

            <DocumentGrid
              documents={paginatedDocuments}
              loading={isLoading}
              emptyMessage="No documents found"
            />

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) =>
                  setCurrentPage(page)
                }
              />
            )}

          </main>

        </div>
      </div>
    </div>
  );
};

export default DocumentList;