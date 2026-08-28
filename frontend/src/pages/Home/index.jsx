import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import {
  Code,
  Briefcase,
  Cpu,
  Activity,
  Scale,
  Brain,
  TrendingUp,
  Clock,
  ArrowRight,
  FileText,
  Download,
} from 'lucide-react';

import SearchBar from '../../components/common/SearchBar';
import DocumentCard from '../../components/document/DocumentCard';

// DOCUMENT API

import {
  getDocumentsApi,
} from '../../services/document.api';

// CATEGORY API

import {
  getCategories,
} from '../../services/category.api';

import {
  formatDate,
} from '../../utils/formatters';

import './Home.css';

// HOME API CACHE
//
// Trong môi trường React Dev + StrictMode,
// useEffect có thể chạy lại.
//
// Home cần:
// - GET /category
// - GET /documents cho Popular
// - GET /documents cho Recent
//
// Cache ngắn giúp tránh gọi API trùng quá nhanh,
// đặc biệt sau khi Backend từng trả 429.
//

let homeDataCache = null;
let homeDataCacheTime = 0;
let homeDataRequest = null;

const HOME_CACHE_TTL = 5000;

// FORMAT FILE SIZE

const formatFileSize = (bytes) => {
  const size =
    Number(bytes || 0);

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

// MAP BACKEND DOCUMENT → DOCUMENT CARD
//
// Backend:
//
// category_title
// file_type
// file_size
// created_at
// download_count
// view_count
// average_rating
// review_count
//
// UI:
//
// major
// fileType
// fileSize
// uploadDate
// downloads
// views
// rating
// reviewCount
//

const mapBackendDocument = (
  doc
) => ({
  id:
    doc.id ||
    doc.document_id,

  title:
    doc.title ||
    'Untitled Document',

  description:
    doc.description ||
    '',

  // UI cũ dùng tên "major".
  // Backend hiện dùng Category.
  major:
    doc.category_title ||
    doc.category_name ||
    doc.category?.title ||
    doc.category?.name ||
    'Uncategorized',

  categoryId:
    doc.category_id ||
    doc.categoryId,

  // Backend hiện không có Subject tương ứng.
  subject: '',

  fileType:
    doc.file_type
      ? doc.file_type
        .split('/')
        .pop()
        .toUpperCase()
      : 'FILE',

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
      doc.uploader_id ||
      null,

    name:
      doc.uploader_name ||
      doc.full_name ||
      'Unknown User',

    avatar:
      doc.uploader_avatar ||
      'https://ui-avatars.com/api/?name=User',

    role:
      doc.uploader_role ||
      'Student',
  },
});

// MAP BACKEND CATEGORY → HOME CATEGORY

const mapBackendCategory = (
  category
) => ({
  id:
    category.id,

  name:
    category.title ||
    category.name ||
    category.slug ||
    'Category',

  slug:
    category.slug ||
    '',

  description:
    category.description ||
    'Explore study materials in this category.',
});

// LOAD HOME DATA
//
// Home cần 3 nhóm dữ liệu:
//
// 1. Category
//
// 2. Popular Documents
//    sortBy = download_count
//
// 3. Recent Documents
//    sortBy = created_at
//

const loadHomeDataApi =
  async () => {
    const now =
      Date.now();

    // CACHE CÒN MỚI

    if (
      homeDataCache &&
      now -
      homeDataCacheTime <
      HOME_CACHE_TTL
    ) {
      return homeDataCache;
    }

    // REQUEST ĐANG CHẠY

    if (homeDataRequest) {
      return homeDataRequest;
    }

    // GỌI BACKEND THẬT

    homeDataRequest =
      Promise.all([
        // ---------------------------------------------
        // CATEGORY
        // ---------------------------------------------

        getCategories(),

        // ---------------------------------------------
        // POPULAR DOCUMENTS
        // ---------------------------------------------

        getDocumentsApi({
          page: 1,
          limit: 3,
          sortBy:
            'download_count',
          order:
            'DESC',
        }),

        // ---------------------------------------------
        // RECENT DOCUMENTS
        // ---------------------------------------------

        getDocumentsApi({
          page: 1,
          limit: 4,
          sortBy:
            'created_at',
          order:
            'DESC',
        }),
      ])
        .then(
          ([
            categoryResponse,
            popularResponse,
            recentResponse,
          ]) => {
            const result = {
              categoryResponse,
              popularResponse,
              recentResponse,
            };

            homeDataCache =
              result;

            homeDataCacheTime =
              Date.now();

            return result;
          }
        );

    try {
      return await homeDataRequest;
    } finally {
      homeDataRequest =
        null;
    }
  };

// HOME COMPONENT

export const Home = () => {
  const navigate =
    useNavigate();

  // 1. CATEGORY STATE

  const [
    categories,
    setCategories,
  ] = useState([]);

  // 2. POPULAR DOCUMENT STATE

  const [
    popularDocs,
    setPopularDocs,
  ] = useState([]);

  // 3. RECENT DOCUMENT STATE

  const [
    recentDocs,
    setRecentDocs,
  ] = useState([]);

  // 4. TOTAL DOCUMENT COUNT
  //
  // Lấy từ:
  //
  // response.pagination.totalCount
  //
  // của GET /documents.
  //
  // Không dùng số mock "50,000+" nữa.
  //

  const [
    totalDocuments,
    setTotalDocuments,
  ] = useState(0);

  // 5. HOME LOADING / ERROR

  const [
    isLoadingHome,
    setIsLoadingHome,
  ] = useState(true);

  const [
    homeError,
    setHomeError,
  ] = useState('');

  // 6. LOAD HOME DATA

  useEffect(() => {
    let isMounted =
      true;

    const loadHomeData =
      async () => {
        setIsLoadingHome(
          true
        );

        setHomeError('');

        try {
          const {
            categoryResponse,
            popularResponse,
            recentResponse,
          } =
            await loadHomeDataApi();

          if (!isMounted) {
            return;
          }

          // CATEGORY

          const backendCategories =
            categoryResponse.data ||
            categoryResponse.categories ||
            [];

          const mappedCategories =
            Array.isArray(
              backendCategories
            )
              ? backendCategories.map(
                mapBackendCategory
              )
              : [];

          setCategories(
            mappedCategories
          );

          // POPULAR DOCUMENTS

          const backendPopularDocs =
            popularResponse.documents ||
            popularResponse.data
              ?.documents ||
            [];

          const mappedPopularDocs =
            Array.isArray(
              backendPopularDocs
            )
              ? backendPopularDocs.map(
                mapBackendDocument
              )
              : [];

          setPopularDocs(
            mappedPopularDocs
          );

          // RECENT DOCUMENTS

          const backendRecentDocs =
            recentResponse.documents ||
            recentResponse.data
              ?.documents ||
            [];

          const mappedRecentDocs =
            Array.isArray(
              backendRecentDocs
            )
              ? backendRecentDocs.map(
                mapBackendDocument
              )
              : [];

          setRecentDocs(
            mappedRecentDocs
          );

          // TOTAL DOCUMENTS

          const totalCount =
            recentResponse
              .pagination
              ?.totalCount ??
            popularResponse
              .pagination
              ?.totalCount ??
            0;

          setTotalDocuments(
            Number(
              totalCount
            ) || 0
          );
        } catch (error) {
          console.error(
            'Home API error:',
            error
          );

          if (!isMounted) {
            return;
          }

          setCategories([]);
          setPopularDocs([]);
          setRecentDocs([]);

          setHomeError(
            error.response
              ?.data
              ?.message ||
            'Unable to load home data.'
          );
        } finally {
          if (isMounted) {
            setIsLoadingHome(
              false
            );
          }
        }
      };

    loadHomeData();

    return () => {
      isMounted =
        false;
    };
  }, []);

  // 7. CATEGORY ICON
  //
  // Backend hiện không trả icon.
  //
  // Đây chỉ là phần presentation của FE,
  // không phải dữ liệu nghiệp vụ.
  //
  // Vì vậy FE luân phiên icon để giữ
  // giao diện Home hiện tại.
  //

  const getCategoryIcon =
    (index) => {
      const icons = [
        Code,
        Briefcase,
        Cpu,
        Activity,
        Scale,
        Brain,
      ];

      const Icon =
        icons[
        index %
        icons.length
        ];

      return (
        <Icon
          size={24}
          className="cat-icon"
        />
      );
    };

  // 8. CATEGORY CLICK
  //
  // UI cũ:
  //
  // /documents?major=...
  //
  // Backend thật dùng:
  //
  // categoryId
  //
  // nên Home chuyển sang:
  //
  // /documents?categoryId=<UUID>
  //
  // DocumentList đã hỗ trợ query này.
  //

  const handleCategoryClick =
    (categoryId) => {
      if (!categoryId) {
        return;
      }

      navigate(
        `/documents?categoryId=${encodeURIComponent(
          categoryId
        )}`
      );
    };

  // 9. UI

  return (
    <div className="payt-home-page">

      {/* =================================================
          1. HERO SECTION
      ================================================= */}

      <section className="home-hero-section sunrise-bg-soft sunrise-glow">

        <div className="container hero-container">

          <div className="hero-badge">

            <span className="sun-dot">
              ●
            </span>

            {' '}
            PayT Academic Sharing Platform

          </div>

          <h1 className="hero-headline">

            Discover knowledge{' '}

            <span className="text-highlight">
              every day
            </span>

          </h1>

          <p className="hero-subtitle">

            Find verified lecture notes,
            past exam papers, and study guides
            that move you forward.

          </p>

          {/* =============================================
              SEARCH
          ============================================= */}

          <div className="hero-search-wrap">

            <SearchBar
              size="lg"
              placeholder="Search documents..."
            />

          </div>

          {/* =============================================
              HOME STATS
          =============================================
          
          Trước:
          
          50,000+ Study Materials
          120+ Universities
          
          Đây là số mock.
          
          Bây giờ:
          
          totalDocuments = pagination.totalCount
          categories.length = GET /category
          
          ============================================= */}

          <div className="hero-stats-row">

            <div className="hero-stat-item">

              <span className="stat-num">

                {
                  isLoadingHome
                    ? '...'
                    : totalDocuments
                      .toLocaleString()
                }

              </span>

              <span className="stat-label">
                Study Materials
              </span>

            </div>

            <div className="stat-divider" />

            <div className="hero-stat-item">

              <span className="stat-num">

                {
                  isLoadingHome
                    ? '...'
                    : categories.length
                }

              </span>

              <span className="stat-label">
                Categories
              </span>

            </div>

            <div className="stat-divider" />

            <div className="hero-stat-item">

              <span className="stat-num">
                100%
              </span>

              <span className="stat-label">
                Free Access
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          2. BROWSE BY CATEGORY
      ================================================= */}

      <section className="home-section browse-major-section">

        <div className="container">

          <div className="section-header">

            <div>

              <h2 className="section-title">
                Browse by Category
              </h2>

              <p className="section-subtitle">
                Explore study materials across
                available academic categories
              </p>

            </div>

            <Link
              to="/documents"
              className="section-link"
            >

              View All Categories

              <ArrowRight
                size={16}
              />

            </Link>

          </div>

          {/* =============================================
              CATEGORY LOADING
          ============================================= */}

          {isLoadingHome ? (

            <div className="payt-card payt-grid-empty">

              <p>
                Loading categories...
              </p>

            </div>

          ) : homeError ? (

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                Unable to load categories
              </h3>

              <p>
                {homeError}
              </p>

            </div>

          ) : categories.length ===
            0 ? (

            // CATEGORY EMPTY

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                No categories available
              </h3>

              <p>
                Categories will appear here
                when they are available.
              </p>

            </div>

          ) : (

            // CATEGORY DATA

            <div className="categories-grid">

              {categories.map(
                (
                  category,
                  index
                ) => (

                  <div
                    key={
                      category.id
                    }
                    className="category-card payt-card payt-card-interactive"
                    onClick={() =>
                      handleCategoryClick(
                        category.id
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        'Enter' ||
                        e.key ===
                        ' '
                      ) {
                        handleCategoryClick(
                          category.id
                        );
                      }
                    }}
                  >

                    <div className="category-icon-box">

                      {
                        getCategoryIcon(
                          index
                        )
                      }

                    </div>

                    <div className="category-info">

                      <h3 className="category-name">
                        {
                          category.name
                        }
                      </h3>

                      <p className="category-desc">
                        {
                          category.description
                        }
                      </p>

                      <span className="category-count">
                        Browse materials
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          3. POPULAR DOCUMENTS
      =================================================
      
      Backend:
      
      GET /documents
      ?page=1
      &limit=3
      &sortBy=download_count
      &order=DESC
      
      ================================================= */}

      <section className="home-section popular-docs-section">

        <div className="container">

          <div className="section-header">

            <div className="title-with-badge">

              <TrendingUp
                className="text-orange"
                size={24}
              />

              <h2 className="section-title">
                Popular Documents
              </h2>

            </div>

            {/* DocumentList dùng sort=downloads */}

            <Link
              to="/documents?sort=downloads"
              className="section-link"
            >

              Browse Popular

              <ArrowRight
                size={16}
              />

            </Link>

          </div>

          {isLoadingHome ? (

            <div className="payt-card payt-grid-empty">

              <p>
                Loading popular documents...
              </p>

            </div>

          ) : homeError ? (

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                Unable to load documents
              </h3>

              <p>
                {homeError}
              </p>

            </div>

          ) : popularDocs.length ===
            0 ? (

            // EMPTY
            //
            // Có thể xảy ra khi Backend hiện chỉ trả
            // document status = approved
            // và chưa có document approved.

            <div className="payt-card payt-grid-empty">

              <FileText
                size={36}
                className="text-orange"
              />

              <h3>
                No popular documents yet
              </h3>

              <p>
                Popular study materials
                will appear here once available.
              </p>

            </div>

          ) : (

            <div className="responsive-grid-3">

              {popularDocs.map(
                (doc) => (

                  <DocumentCard
                    key={
                      doc.id
                    }
                    document={
                      doc
                    }
                  />

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          4. RECENT UPLOADS
      =================================================
      
      Backend:
      
      GET /documents
      ?page=1
      &limit=4
      &sortBy=created_at
      &order=DESC
      
      ================================================= */}

      <section className="home-section recent-uploads-section">

        <div className="container">

          <div className="section-header">

            <div className="title-with-badge">

              <Clock
                className="text-orange"
                size={24}
              />

              <h2 className="section-title">
                Recent Uploads
              </h2>

            </div>

            <Link
              to="/documents?sort=newest"
              className="section-link"
            >

              See Newest

              <ArrowRight
                size={16}
              />

            </Link>

          </div>

          <div className="payt-card recent-list-card">

            {isLoadingHome ? (

              <div className="payt-grid-empty">

                <p>
                  Loading recent documents...
                </p>

              </div>

            ) : homeError ? (

              <div className="payt-grid-empty">

                <FileText
                  size={36}
                  className="text-orange"
                />

                <h3>
                  Unable to load recent documents
                </h3>

                <p>
                  {homeError}
                </p>

              </div>

            ) : recentDocs.length ===
              0 ? (

              // EMPTY

              <div className="payt-grid-empty">

                <FileText
                  size={36}
                  className="text-orange"
                />

                <h3>
                  No recent uploads yet
                </h3>

                <p>
                  New approved study materials
                  will appear here.
                </p>

              </div>

            ) : (

              recentDocs.map(
                (
                  doc,
                  index
                ) => (

                  <div
                    key={
                      doc.id
                    }
                    className={
                      `recent-item ${index !==
                        recentDocs.length -
                        1
                        ? 'has-border'
                        : ''
                      }`
                    }
                  >

                    {/* ===================================
                        LEFT
                    =================================== */}

                    <div className="recent-main-info">

                      <div className="recent-icon">

                        <FileText
                          size={20}
                          className="text-orange"
                        />

                      </div>

                      <div className="recent-text">

                        <Link
                          to={`/documents/${doc.id}`}
                          className="recent-title"
                        >
                          {doc.title}
                        </Link>

                        <div className="recent-meta">

                          <span className="badge badge-major">
                            {doc.major}
                          </span>

                          {/* Backend không có Subject.
                              Không render dữ liệu giả. */}

                          {doc.subject && (

                            <span>
                              {doc.subject}
                            </span>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* ===================================
                        RIGHT
                    =================================== */}

                    <div className="recent-right-info">

                      <span className="recent-date">

                        {
                          formatDate(
                            doc.uploadDate
                          )
                        }

                      </span>

                      <span className="recent-downloads">

                        <Download
                          size={14}
                        />

                        {' '}

                        {
                          doc.downloads
                        }

                      </span>

                      <Link
                        to={`/documents/${doc.id}`}
                        className="view-btn-link"
                      >
                        View
                      </Link>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

    </div>
  );
};

export default Home;