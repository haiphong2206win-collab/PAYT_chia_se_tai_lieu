import { useState, useEffect } from 'react';
import {
  useSearchParams,
  useNavigate,
} from 'react-router-dom';

import {
  SlidersHorizontal,
} from 'lucide-react';

import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DocumentGrid from '../../components/document/DocumentGrid';
import DocumentFilter from '../../components/document/DocumentFilter';
import Pagination from '../../components/common/Pagination';

import {
  getDocumentsApi,
} from '../../services/document.api';

import {
  SORT_OPTIONS,
} from '../../utils/constants';

import './DocumentList.css';

// =====================================================
// SỐ DOCUMENT HIỂN THỊ TRÊN MỖI TRANG
// =====================================================

const ITEMS_PER_PAGE = 6;

// =====================================================
// HELPER: FORMAT FILE SIZE
// =====================================================
//
// Backend trả file_size dưới dạng bytes.
//
// Ví dụ:
// 367527 bytes
//
// FE chuyển thành:
// 358.91 KB
//
// =====================================================

const formatFileSize = (bytes) => {
  const size = Number(bytes || 0);

  if (!size) {
    return '0 KB';
  }

  if (size >= 1024 * 1024) {
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  }

  return `${(
    size /
    1024
  ).toFixed(2)} KB`;
};

// =====================================================
// HELPER: FORMAT FILE TYPE
// =====================================================
//
// Backend có thể trả:
//
// application/pdf
//
// UI cũ lại muốn:
//
// PDF
//
// Vì vậy FE cần map lại.
// =====================================================

const formatFileType = (fileType) => {
  if (!fileType) {
    return 'Other';
  }

  const type =
    fileType.toLowerCase();

  if (type.includes('pdf')) {
    return 'PDF';
  }

  if (
    type.includes('presentation') ||
    type.includes('powerpoint')
  ) {
    return 'Slides';
  }

  if (
    type.includes('word') ||
    type.includes('text')
  ) {
    return 'Notes';
  }

  return 'Other';
};

// =====================================================
// COMPONENT
// =====================================================

export const DocumentList = () => {
  // ===================================================
  // 1. ROUTER
  // ===================================================

  const [searchParams] =
    useSearchParams();

  const navigate =
    useNavigate();

  // ===================================================
  // 2. URL SEARCH PARAMS
  // ===================================================

  const initialSearch =
    searchParams.get('search') || '';

  const initialMajor =
    searchParams.get('major') || '';

  // ===================================================
  // 3. DOCUMENT DATA TỪ BACKEND
  // ===================================================
  //
  // Trước đây:
  //
  // MOCK_DOCUMENTS
  //
  // Bây giờ:
  //
  // GET /documents
  // ↓
  // response.documents
  // ↓
  // map Backend → UI
  // ↓
  // backendDocuments
  //
  // ===================================================

  const [
    backendDocuments,
    setBackendDocuments,
  ] = useState([]);

  // Loading thật của API
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  // Lỗi khi GET document
  const [
    loadError,
    setLoadError,
  ] = useState('');

  // ===================================================
  // 4. LOAD DOCUMENTS TỪ BACKEND
  // ===================================================

  useEffect(() => {
    const fetchDocuments =
      async () => {
        setIsLoading(true);
        setLoadError('');

        try {
          // ============================================
          // GET /documents
          // ============================================

          const response =
            await getDocumentsApi();

          console.log(
            'Documents from Backend:',
            response
          );

          // Backend hiện trả:
          //
          // {
          //   message: "...",
          //   documents: [...],
          //   pagination: {...}
          // }

          const documents =
            response.documents ||
            response.data ||
            [];

          // ============================================
          // MAP BACKEND → FORMAT UI CŨ
          // ============================================
          //
          // Đây là bước rất quan trọng.
          //
          // Backend:
          // category_title
          // category_id
          // file_size
          // file_type
          // download_count
          // created_at
          //
          // UI:
          // major
          // categoryId
          // fileSize
          // fileType
          // downloads
          // uploadDate
          //
          // =================================================

          const mappedDocuments =
            documents.map((doc) => ({
              // ============================================
              // QUAN TRỌNG NHẤT
              // ============================================
              //
              // ID này là UUID thật từ Database.
              //
              // Ví dụ:
              // 69b5b176-....
              //
              // Không còn:
              // doc-1
              // doc-2
              // doc-3
              //
              // ============================================

              id:
                doc.id,

              title:
                doc.title ||
                'Untitled Document',

              description:
                doc.description || '',

              // UI cũ gọi field này là major.
              // Nhưng dữ liệu BE thật là Category.
              //
              // Tạm giữ tên "major"
              // để DocumentGrid cũ không bị vỡ.
              major:
                doc.category_title ||
                'Uncategorized',

              // Dùng cho filter legacy hiện tại.
              majorSlug:
                doc.category_slug ||
                doc.category_title ||
                '',

              // BE hiện chưa có Subject tương ứng.
              subject: '',

              categoryId:
                doc.category_id,

              fileType:
                formatFileType(
                  doc.file_type
                ),

              rawFileType:
                doc.file_type,

              fileSize:
                formatFileSize(
                  doc.file_size
                ),

              fileUrl:
                doc.file_url,

              uploadDate:
                doc.created_at,

              downloads:
                Number(
                  doc.download_count
                ) || 0,

              views:
                Number(
                  doc.view_count
                ) || 0,

              rating:
                Number(
                  doc.average_rating
                ) || 0,

              reviewCount:
                Number(
                  doc.review_count
                ) || 0,

              status:
                doc.status,

              // Nếu GET /documents có uploader info,
              // các field này sẽ được dùng.
              uploader: {
                id:
                  doc.uploader_id,

                name:
                  doc.uploader_name ||
                  doc.full_name ||
                  'Unknown User',

                avatar:
                  doc.uploader_avatar ||
                  '',
              },
            }));

          console.log(
            'Mapped Documents for UI:',
            mappedDocuments
          );

          // ============================================
          // DỮ LIỆU THẬT VÀO REACT STATE
          // ============================================

          setBackendDocuments(
            mappedDocuments
          );

        } catch (error) {
          console.error(
            'Get documents error:',
            error
          );

          setBackendDocuments([]);

          setLoadError(
            error.response?.data?.message ||
            'Unable to load documents.'
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchDocuments();
  }, []);

  // ===================================================
  // 5. FILTER STATES
  // ===================================================
  //
  // PHẦN FILTER NÀY HIỆN VẪN GIỮ UI CŨ.
  //
  // Sau khi Document List real PASS,
  // bước kế tiếp mình sẽ chuyển nó sang:
  //
  // categoryId
  // search
  // sortBy
  // order
  //
  // theo API Backend thật.
  //
  // ===================================================

  const [
    selectedMajors,
    setSelectedMajors,
  ] = useState(() =>
    initialMajor
      ? [initialMajor]
      : []
  );

  const [
    selectedTypes,
    setSelectedTypes,
  ] = useState([]);

  const [
    selectedSubjects,
    setSelectedSubjects,
  ] = useState([]);

  // ===================================================
  // 6. SORT / PAGINATION / MOBILE FILTER
  // ===================================================

  const [
    sortValue,
    setSortValue,
  ] = useState('popular');

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    showMobileFilter,
    setShowMobileFilter,
  ] = useState(false);

  // ===================================================
  // 7. INITIAL MAJOR TỪ URL
  // ===================================================

  useEffect(() => {
    if (initialMajor) {
      setSelectedMajors(
        (prev) =>
          prev.includes(
            initialMajor
          )
            ? prev
            : [
              ...prev,
              initialMajor,
            ]
      );
    }
  }, [initialMajor]);

  // ===================================================
  // 8. SEARCH HELPERS
  // ===================================================

  const normalizeStr = (s) =>
    s
      ? s
        .toLowerCase()
        .replace(
          /[\s-_]+/g,
          ''
        )
      : '';

  const searchQuery =
    initialSearch
      .trim()
      .toLowerCase();

  // ===================================================
  // 9. RESET PAGE
  // ===================================================
  //
  // Khi search/filter/sort đổi,
  // quay lại page 1.
  //
  // ===================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedMajors,
    selectedTypes,
    selectedSubjects,
    sortValue,
  ]);

  // ===================================================
  // 10. FILTER LOCAL TRÊN DATA BACKEND
  // ===================================================
  //
  // QUAN TRỌNG:
  //
  // Trước đây:
  //
  // MOCK_DOCUMENTS.filter(...)
  //
  // Bây giờ:
  //
  // backendDocuments.filter(...)
  //
  // Đây là thay đổi giúp xóa MOCK khỏi Document List.
  //
  // Search/filter thật bằng query API
  // sẽ làm ở bước tiếp theo.
  //
  // ===================================================

  const filteredDocuments =
    backendDocuments.filter(
      (doc) => {
        // =============================================
        // SEARCH
        // =============================================

        if (searchQuery) {
          const titleMatch =
            doc.title
              ?.toLowerCase()
              .includes(
                searchQuery
              );

          const majorMatch =
            doc.major
              ?.toLowerCase()
              .includes(
                searchQuery
              );

          const descMatch =
            doc.description
              ?.toLowerCase()
              .includes(
                searchQuery
              );

          if (
            !titleMatch &&
            !majorMatch &&
            !descMatch
          ) {
            return false;
          }
        }

        // =============================================
        // LEGACY MAJOR FILTER
        // =============================================
        //
        // Tạm map Category → major
        // để UI cũ vẫn chạy.
        //
        // Bước sau sẽ đổi thành Category Filter thật.
        //
        // =============================================

        if (
          selectedMajors.length >
          0
        ) {
          const matchesMajor =
            selectedMajors.some(
              (selected) => {
                const normSelected =
                  normalizeStr(
                    selected
                  );

                const normDocMajor =
                  normalizeStr(
                    doc.major
                  );

                const normDocSlug =
                  normalizeStr(
                    doc.majorSlug
                  );

                return (
                  normDocMajor ===
                  normSelected ||
                  normDocSlug ===
                  normSelected
                );
              }
            );

          if (!matchesMajor) {
            return false;
          }
        }

        // =============================================
        // FILE TYPE FILTER
        // =============================================

        if (
          selectedTypes.length >
          0
        ) {
          const matchesType =
            selectedTypes.some(
              (type) => {
                if (
                  type === 'Other'
                ) {
                  return ![
                    'PDF',
                    'Slides',
                    'Notes',
                  ].includes(
                    doc.fileType
                  );
                }

                return (
                  doc.fileType
                    ?.toLowerCase() ===
                  type.toLowerCase()
                );
              }
            );

          if (!matchesType) {
            return false;
          }
        }

        // =============================================
        // SUBJECT FILTER
        // =============================================
        //
        // Backend hiện không có field subject.
        // Vì vậy phần này chưa phải filter chính thức.
        //
        // =============================================

        if (
          selectedSubjects.length >
          0
        ) {
          const matchesSubject =
            selectedSubjects.some(
              (subj) => {
                if (!doc.subject) {
                  return false;
                }

                const normSubj =
                  normalizeStr(
                    subj
                  );

                const normDocSubj =
                  normalizeStr(
                    doc.subject
                  );

                return (
                  normDocSubj.includes(
                    normSubj
                  ) ||
                  normSubj.includes(
                    normDocSubj
                  )
                );
              }
            );

          if (!matchesSubject) {
            return false;
          }
        }

        return true;
      }
    );

  // ===================================================
  // 11. SORT LOCAL
  // ===================================================
  //
  // Tạm sort trên dữ liệu Backend đã tải về.
  //
  // Bước tiếp theo sẽ dùng:
  //
  // sortBy
  // order
  //
  // từ API Backend.
  //
  // ===================================================

  const sortedDocuments = [
    ...filteredDocuments,
  ].sort((a, b) => {
    // Popular
    if (
      sortValue === 'popular'
    ) {
      return (
        (b.downloads || 0) -
        (a.downloads || 0)
      );
    }

    // Rating
    if (
      sortValue === 'rating'
    ) {
      return (
        (b.rating || 0) -
        (a.rating || 0)
      );
    }

    // Newest
    if (
      sortValue === 'newest'
    ) {
      const dateA =
        a.uploadDate
          ? new Date(
            a.uploadDate
          ).getTime()
          : 0;

      const dateB =
        b.uploadDate
          ? new Date(
            b.uploadDate
          ).getTime()
          : 0;

      return dateB - dateA;
    }

    return 0;
  });

  // ===================================================
  // 12. PAGINATION LOCAL
  // ===================================================

  const totalPages =
    Math.ceil(
      sortedDocuments.length /
      ITEMS_PER_PAGE
    );

  const startIndex =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedDocuments =
    sortedDocuments.slice(
      startIndex,
      startIndex +
      ITEMS_PER_PAGE
    );

  // ===================================================
  // 13. FILTER HANDLERS
  // ===================================================

  const handleFilterChange = ({
    majors,
    types,
    subjects,
  }) => {
    if (
      majors !== undefined
    ) {
      setSelectedMajors(
        majors
      );
    }

    if (
      types !== undefined
    ) {
      setSelectedTypes(types);
    }

    if (
      subjects !== undefined
    ) {
      setSelectedSubjects(
        subjects
      );
    }
  };

  // ===================================================
  // 14. CLEAR FILTER
  // ===================================================

  const handleClearFilters =
    () => {
      setSelectedMajors([]);
      setSelectedTypes([]);
      setSelectedSubjects([]);

      if (initialMajor) {
        const searchParam =
          initialSearch
            ? `?search=${encodeURIComponent(
              initialSearch
            )}`
            : '';

        navigate(
          `/documents${searchParam}`
        );
      }
    };

  // ===================================================
  // 15. UI
  // ===================================================

  return (
    <div className="payt-document-list-page">

      {/* ===============================================
          TOP BANNER
      =============================================== */}

      <div className="doc-list-banner sunrise-bg-soft">

        <div className="container">

          <h1 className="banner-title">
            Documents Archive
          </h1>

          <p className="banner-subtitle">
            Browse verified lecture notes,
            exam prep, and study guides
            from top universities.
          </p>

          <div className="banner-search-box">

            <SearchBar
              size="md"
              initialValue={
                initialSearch
              }
              placeholder="Filter by title, topic, category..."
            />

          </div>

        </div>

      </div>

      {/* ===============================================
          MAIN CONTENT
      =============================================== */}

      <div className="container doc-list-container">

        {/* =============================================
            TOOLBAR
        ============================================= */}

        <div className="doc-list-toolbar">

          <div className="results-count">

            Showing{' '}

            <strong>
              {
                filteredDocuments.length
              }
            </strong>{' '}

            study documents

          </div>

          <div className="toolbar-controls">

            {/* MOBILE FILTER BUTTON */}

            <button
              type="button"
              className="mobile-filter-toggle-btn payt-btn payt-btn-secondary"
              onClick={() =>
                setShowMobileFilter(
                  !showMobileFilter
                )
              }
            >

              <SlidersHorizontal
                size={16}
              />

              <span>
                Filters
              </span>

            </button>

            {/* SORT */}

            <div className="sort-dropdown-wrap">

              <span className="sort-label">
                Sort by:
              </span>

              <Select
                options={
                  SORT_OPTIONS
                }
                value={
                  sortValue
                }
                onChange={(e) =>
                  setSortValue(
                    e.target.value
                  )
                }
                placeholder={null}
              />

            </div>

          </div>

        </div>

        {/* =============================================
            SIDEBAR + DOCUMENT GRID
        ============================================= */}

        <div className="doc-list-layout">

          {/* FILTER SIDEBAR */}

          <aside
            className={
              `filter-sidebar-wrapper ${showMobileFilter
                ? 'mobile-visible'
                : ''
              }`
            }
          >

            <DocumentFilter
              selectedMajors={
                selectedMajors
              }
              selectedTypes={
                selectedTypes
              }
              selectedSubjects={
                selectedSubjects
              }
              onFilterChange={
                handleFilterChange
              }
              onClearFilters={
                handleClearFilters
              }
            />

          </aside>

          {/* ===========================================
              DOCUMENT GRID
          =========================================== */}

          <main className="grid-main-wrapper">

            <DocumentGrid
              documents={
                paginatedDocuments
              }
              loading={
                isLoading
              }
              emptyMessage={
                loadError ||
                'No documents found'
              }
            />

            {/* =========================================
                PAGINATION
            ========================================= */}

            {totalPages > 1 && (

              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={(
                  page
                ) =>
                  setCurrentPage(
                    page
                  )
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