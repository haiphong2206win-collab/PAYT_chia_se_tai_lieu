import {
  useEffect,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'react-router-dom';

import {
  SlidersHorizontal,
} from 'lucide-react';

import SearchBar from '../../components/common/SearchBar';
import Select from '../../components/common/Select';
import DocumentGrid from '../../components/document/DocumentGrid';
import Pagination from '../../components/common/Pagination';

import {
  getDocumentsApi,
} from '../../services/document.api';

import {
  getCategories,
} from '../../services/category.api';

import './DocumentList.css';

// =====================================================
// DOCUMENTS / PAGE
// =====================================================

const ITEMS_PER_PAGE = 6;

// =====================================================
// SORT OPTIONS
// =====================================================
//
// Chỉ dùng field Backend THỰC SỰ hỗ trợ:
//
// created_at
// download_count
// view_count
// review_count
//
// Không dùng average_rating vì API contract hiện
// chưa hỗ trợ sortBy average_rating.
//
// =====================================================

const DOCUMENT_SORT_OPTIONS = [
  {
    value: 'newest',
    label: 'Most Recent',
  },
  {
    value: 'downloads',
    label: 'Most Downloaded',
  },
  {
    value: 'views',
    label: 'Most Viewed',
  },
  {
    value: 'reviews',
    label: 'Most Reviewed',
  },
];

// =====================================================
// MAP SORT UI → BACKEND QUERY
// =====================================================

const SORT_QUERY_MAP = {
  newest: {
    sortBy: 'created_at',
    order: 'DESC',
  },

  downloads: {
    sortBy: 'download_count',
    order: 'DESC',
  },

  views: {
    sortBy: 'view_count',
    order: 'DESC',
  },

  reviews: {
    sortBy: 'review_count',
    order: 'DESC',
  },
};

// =====================================================
// FORMAT FILE SIZE
// =====================================================

const formatFileSize = (
  bytes
) => {
  const size =
    Number(
      bytes || 0
    );

  if (!size) {
    return '0 KB';
  }

  if (
    size >=
    1024 * 1024
  ) {
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
// FORMAT FILE TYPE
// =====================================================

const formatFileType = (
  fileType
) => {
  if (!fileType) {
    return 'Other';
  }

  const type =
    fileType.toLowerCase();

  if (
    type.includes(
      'pdf'
    )
  ) {
    return 'PDF';
  }

  if (
    type.includes(
      'presentation'
    ) ||
    type.includes(
      'powerpoint'
    )
  ) {
    return 'Slides';
  }

  if (
    type.includes(
      'word'
    ) ||
    type.includes(
      'text'
    )
  ) {
    return 'Notes';
  }

  return 'Other';
};

// =====================================================
// NORMALIZE STRING
// =====================================================
//
// Dùng để map link cũ:
//
// /documents?major=computer-science
//
// sang Category thật từ Backend.
//
// =====================================================

const normalizeString = (
  value
) =>
  value
    ? value
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ''
      )
    : '';

// =====================================================
// MAP BACKEND DOCUMENT → UI
// =====================================================

const mapBackendDocument = (
  doc
) => ({
  // UUID thật
  id:
    doc.id,

  title:
    doc.title ||
    'Untitled Document',

  description:
    doc.description ||
    '',

  // UI cũ đang dùng major.
  // Backend thực tế là Category.
  major:
    doc.category_title ||
    'Uncategorized',

  majorSlug:
    doc.category_slug ||
    '',

  subject:
    '',

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
});

// =====================================================
// DOCUMENT LIST
// =====================================================

export const DocumentList =
  () => {
    // =================================================
    // 1. URL SEARCH PARAMS
    // =================================================
    //
    // Ví dụ:
    //
    // /documents
    // ?search=hsk
    // &categoryId=xxx
    // &sort=newest
    // &page=2
    //
    // =================================================

    const [
      searchParams,
      setSearchParams,
    ] =
      useSearchParams();

    const searchQuery =
      (
        searchParams.get(
          'search'
        ) || ''
      ).trim();

    const selectedCategoryId =
      searchParams.get(
        'categoryId'
      ) || '';

    const oldMajorParam =
      searchParams.get(
        'major'
      ) || '';

    const sortValue =
      searchParams.get(
        'sort'
      ) ||
      'newest';

    const rawPage =
      Number(
        searchParams.get(
          'page'
        ) || 1
      );

    const currentPage =
      Number.isFinite(
        rawPage
      ) &&
        rawPage > 0
        ? rawPage
        : 1;

    // =================================================
    // 2. DOCUMENT STATE
    // =================================================

    const [
      documents,
      setDocuments,
    ] =
      useState([]);

    const [
      isLoading,
      setIsLoading,
    ] =
      useState(true);

    const [
      loadError,
      setLoadError,
    ] =
      useState('');

    // =================================================
    // 3. PAGINATION STATE
    // =================================================
    //
    // Backend thật trả:
    //
    // currentPage
    // totalCount
    // limit
    // totalPage
    //
    // =================================================

    const [
      pagination,
      setPagination,
    ] =
      useState({
        currentPage: 1,
        totalCount: 0,
        limit:
          ITEMS_PER_PAGE,
        totalPage: 0,
      });

    // =================================================
    // 4. CATEGORY STATE
    // =================================================

    const [
      categories,
      setCategories,
    ] =
      useState([]);

    const [
      isLoadingCategories,
      setIsLoadingCategories,
    ] =
      useState(true);

    // =================================================
    // 5. MOBILE FILTER STATE
    // =================================================

    const [
      showMobileFilter,
      setShowMobileFilter,
    ] =
      useState(false);

    // =================================================
    // 6. UPDATE URL PARAMS HELPER
    // =================================================

    const updateUrlParams = (
      changes
    ) => {
      const nextParams =
        new URLSearchParams(
          searchParams
        );

      Object.entries(
        changes
      ).forEach(
        ([
          key,
          value,
        ]) => {
          if (
            value === '' ||
            value === null ||
            value ===
            undefined
          ) {
            nextParams.delete(
              key
            );
          } else {
            nextParams.set(
              key,
              String(
                value
              )
            );
          }
        }
      );

      setSearchParams(
        nextParams
      );
    };

    // =================================================
    // 7. GET CATEGORIES
    // =================================================
    //
    // GET /category
    //
    // Category thật thay cho Major mock.
    //
    // =================================================

    useEffect(() => {
      const loadCategories =
        async () => {
          setIsLoadingCategories(
            true
          );

          try {
            const response =
              await getCategories();

            console.log(
              'Document List Category API response:',
              response
            );

            const data =
              response.data ||
              response.categories ||
              [];

            setCategories(
              Array.isArray(
                data
              )
                ? data
                : []
            );
          } catch (error) {
            console.error(
              'Document List Category API error:',
              error
            );

            setCategories(
              []
            );
          } finally {
            setIsLoadingCategories(
              false
            );
          }
        };

      loadCategories();
    }, []);

    // =================================================
    // 8. SUPPORT URL CŨ ?major=
    // =================================================
    //
    // Home/Figma cũ có thể điều hướng:
    //
    // /documents?major=computer-science
    //
    // Backend mới cần:
    //
    // categoryId
    //
    // Vì vậy tìm Category tương ứng,
    // sau đó đổi URL sang categoryId.
    //
    // =================================================

    useEffect(() => {
      if (
        !oldMajorParam ||
        selectedCategoryId ||
        categories.length ===
        0
      ) {
        return;
      }

      const normalizedMajor =
        normalizeString(
          oldMajorParam
        );

      const matchedCategory =
        categories.find(
          (category) => {
            const title =
              normalizeString(
                category.title
              );

            const name =
              normalizeString(
                category.name
              );

            const slug =
              normalizeString(
                category.slug
              );

            return (
              title ===
              normalizedMajor ||
              name ===
              normalizedMajor ||
              slug ===
              normalizedMajor
            );
          }
        );

      if (
        !matchedCategory?.id
      ) {
        return;
      }

      const nextParams =
        new URLSearchParams(
          searchParams
        );

      nextParams.delete(
        'major'
      );

      nextParams.set(
        'categoryId',
        matchedCategory.id
      );

      nextParams.set(
        'page',
        '1'
      );

      setSearchParams(
        nextParams,
        {
          replace: true,
        }
      );
    }, [
      oldMajorParam,
      selectedCategoryId,
      categories,
      searchParams,
      setSearchParams,
    ]);

    // =================================================
    // 9. GET DOCUMENTS - SERVER SIDE
    // =================================================
    //
    // Không còn:
    //
    // frontend.filter()
    // frontend.sort()
    // frontend.slice()
    //
    // Bây giờ:
    //
    // UI state
    // ↓
    // query params
    // ↓
    // Backend
    // ↓
    // documents + pagination
    //
    // =================================================

    useEffect(() => {
      const loadDocuments =
        async () => {
          setIsLoading(
            true
          );

          setLoadError(
            ''
          );

          try {
            const sortConfig =
              SORT_QUERY_MAP[
              sortValue
              ] ||
              SORT_QUERY_MAP
                .newest;

            // =========================================
            // QUERY GỬI BACKEND
            // =========================================

            const query = {
              page:
                currentPage,

              limit:
                ITEMS_PER_PAGE,

              sortBy:
                sortConfig.sortBy,

              order:
                sortConfig.order,
            };

            // Search chỉ gửi nếu có keyword.
            if (
              searchQuery
            ) {
              query.search =
                searchQuery;
            }

            // Category chỉ gửi nếu user chọn.
            if (
              selectedCategoryId
            ) {
              query.categoryId =
                selectedCategoryId;
            }

            console.log(
              'GET Documents query:',
              query
            );

            const response =
              await getDocumentsApi(
                query
              );

            console.log(
              'Documents from Backend:',
              response
            );

            const backendDocuments =
              response.documents ||
              response.data
                ?.documents ||
              (
                Array.isArray(
                  response.data
                )
                  ? response.data
                  : []
              );

            const mappedDocuments =
              backendDocuments.map(
                mapBackendDocument
              );

            console.log(
              'Mapped Documents for UI:',
              mappedDocuments
            );

            setDocuments(
              mappedDocuments
            );

            // =========================================
            // PAGINATION TỪ BACKEND
            // =========================================

            const backendPagination =
              response.pagination ||
              response.data
                ?.pagination ||
              {};

            setPagination({
              currentPage:
                Number(
                  backendPagination
                    .currentPage
                ) ||
                currentPage,

              totalCount:
                Number(
                  backendPagination
                    .totalCount
                ) ||
                0,

              limit:
                Number(
                  backendPagination
                    .limit
                ) ||
                ITEMS_PER_PAGE,

              totalPage:
                Number(
                  backendPagination
                    .totalPage
                ) ||
                0,
            });
          } catch (error) {
            console.error(
              'Get documents error:',
              error
            );

            setDocuments(
              []
            );

            setPagination({
              currentPage:
                currentPage,

              totalCount:
                0,

              limit:
                ITEMS_PER_PAGE,

              totalPage:
                0,
            });

            setLoadError(
              error.response
                ?.data
                ?.message ||
              'Unable to load documents.'
            );
          } finally {
            setIsLoading(
              false
            );
          }
        };

      loadDocuments();
    }, [
      searchQuery,
      selectedCategoryId,
      sortValue,
      currentPage,
    ]);

    // =================================================
    // 10. CATEGORY CHANGE
    // =================================================

    const handleCategoryChange =
      (event) => {
        const categoryId =
          event.target.value;

        const nextParams =
          new URLSearchParams(
            searchParams
          );

        nextParams.delete(
          'major'
        );

        if (
          categoryId
        ) {
          nextParams.set(
            'categoryId',
            categoryId
          );
        } else {
          nextParams.delete(
            'categoryId'
          );
        }

        // Filter đổi
        // → quay về page 1.
        nextParams.set(
          'page',
          '1'
        );

        setSearchParams(
          nextParams
        );
      };

    // =================================================
    // 11. SORT CHANGE
    // =================================================

    const handleSortChange =
      (event) => {
        updateUrlParams({
          sort:
            event.target
              .value,

          page:
            1,
        });
      };

    // =================================================
    // 12. PAGE CHANGE
    // =================================================

    const handlePageChange =
      (page) => {
        updateUrlParams({
          page,
        });

        window.scrollTo({
          top: 0,
          behavior:
            'smooth',
        });
      };

    // =================================================
    // 13. CLEAR FILTER
    // =================================================
    //
    // Giữ Search.
    //
    // Chỉ xóa:
    //
    // Category
    // Major legacy
    // Page
    //
    // =================================================

    const handleClearFilters =
      () => {
        const nextParams =
          new URLSearchParams(
            searchParams
          );

        nextParams.delete(
          'categoryId'
        );

        nextParams.delete(
          'major'
        );

        nextParams.set(
          'page',
          '1'
        );

        setSearchParams(
          nextParams
        );
      };

    // =================================================
    // 14. RESULTS RANGE
    // =================================================

    const resultStart =
      pagination.totalCount >
        0
        ? (
          currentPage -
          1
        ) *
        pagination.limit +
        1
        : 0;

    const resultEnd =
      Math.min(
        currentPage *
        pagination.limit,

        pagination.totalCount
      );

    // =================================================
    // 15. UI
    // =================================================

    return (
      <div className="payt-document-list-page">

        {/* =============================================
            TOP BANNER
        ============================================= */}

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

            {/* =========================================
                SEARCH
            =========================================
                
            SearchBar hiện đồng bộ keyword vào:

            /documents?search=...

            Khi URL thay đổi,
            useEffect phía trên tự GET Backend lại.
                
            ========================================= */}

            <div className="banner-search-box">

              <SearchBar
                size="md"
                initialValue={
                  searchQuery
                }
                placeholder="Search documents..."
              />

            </div>

          </div>

        </div>

        {/* =============================================
            MAIN
        ============================================= */}

        <div className="container doc-list-container">

          {/* ===========================================
              TOOLBAR
          =========================================== */}

          <div className="doc-list-toolbar">

            <div className="results-count">

              {isLoading ? (

                'Loading documents...'

              ) : pagination.totalCount >
                0 ? (

                <>

                  Showing{' '}

                  <strong>
                    {resultStart}
                    -
                    {resultEnd}
                  </strong>

                  {' '}of{' '}

                  <strong>
                    {
                      pagination.totalCount
                    }
                  </strong>

                  {' '}study documents

                </>

              ) : (

                <>
                  Showing{' '}
                  <strong>
                    0
                  </strong>{' '}
                  study documents
                </>

              )}

            </div>

            <div className="toolbar-controls">

              {/* MOBILE FILTER */}

              <button
                type="button"
                className="mobile-filter-toggle-btn payt-btn payt-btn-secondary"
                onClick={() =>
                  setShowMobileFilter(
                    (
                      previous
                    ) =>
                      !previous
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

              {/* =======================================
                  SORT - BACKEND THẬT
              ======================================= */}

              <div className="sort-dropdown-wrap">

                <span className="sort-label">
                  Sort by:
                </span>

                <Select
                  options={
                    DOCUMENT_SORT_OPTIONS
                  }
                  value={
                    sortValue
                  }
                  onChange={
                    handleSortChange
                  }
                  placeholder={
                    null
                  }
                />

              </div>

            </div>

          </div>

          {/* ===========================================
              CONTENT LAYOUT
          =========================================== */}

          <div className="doc-list-layout">

            {/* =========================================
                REAL CATEGORY FILTER
            =========================================
                
            Backend hiện hỗ trợ categoryId.

            Không giữ Subject / Document Type
            filter giả vì Backend chưa có contract
            cho 2 field đó.
                
            ========================================= */}

            <aside
              className={
                `filter-sidebar-wrapper ${showMobileFilter
                  ? 'mobile-visible'
                  : ''
                }`
              }
            >

              <div
                className="payt-card"
                style={{
                  padding:
                    '20px',
                }}
              >

                <div
                  style={{
                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'space-between',

                    gap:
                      '12px',

                    marginBottom:
                      '18px',
                  }}
                >

                  <h3
                    style={{
                      margin:
                        0,
                    }}
                  >
                    Filters
                  </h3>

                  {selectedCategoryId && (

                    <button
                      type="button"
                      onClick={
                        handleClearFilters
                      }
                      style={{
                        border:
                          'none',

                        background:
                          'transparent',

                        cursor:
                          'pointer',

                        color:
                          '#F59E42',

                        fontWeight:
                          600,
                      }}
                    >
                      Clear
                    </button>

                  )}

                </div>

                {/* CATEGORY */}

                <div className="payt-input-group">

                  <label
                    className="payt-input-label"
                    htmlFor="document-category-filter"
                  >
                    Category
                  </label>

                  <select
                    id="document-category-filter"
                    className="payt-input"
                    value={
                      selectedCategoryId
                    }
                    onChange={
                      handleCategoryChange
                    }
                    disabled={
                      isLoadingCategories
                    }
                  >

                    <option value="">

                      {isLoadingCategories
                        ? 'Loading categories...'
                        : 'All Categories'}

                    </option>

                    {categories.map(
                      (
                        category
                      ) => (

                        <option
                          key={
                            category.id
                          }
                          value={
                            category.id
                          }
                        >

                          {
                            category.title ||
                            category.name ||
                            category.slug ||
                            'Category'
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>

            </aside>

            {/* =========================================
                DOCUMENT GRID
            ========================================= */}

            <main className="grid-main-wrapper">

              <DocumentGrid
                documents={
                  documents
                }
                loading={
                  isLoading
                }
                emptyMessage={
                  loadError ||
                  'No documents found'
                }
              />

              {/* =======================================
                  SERVER-SIDE PAGINATION
              ======================================= */}

              {pagination.totalPage >
                1 && (

                  <Pagination
                    currentPage={
                      currentPage
                    }
                    totalPages={
                      pagination.totalPage
                    }
                    onPageChange={
                      handlePageChange
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