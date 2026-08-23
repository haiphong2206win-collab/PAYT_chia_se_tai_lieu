import { Link, useNavigate } from 'react-router-dom';
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
  Download
} from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import DocumentCard from '../../components/document/DocumentCard';
import { MOCK_CATEGORIES } from '../../mock/categories';
import { MOCK_DOCUMENTS } from '../../mock/documents';
import { formatDate } from '../../utils/formatters';
import './Home.css';

export const Home = () => {
  const navigate = useNavigate();
  const popularDocs = MOCK_DOCUMENTS.filter((doc) => doc.popular).slice(0, 3);
  const recentDocs = MOCK_DOCUMENTS.slice(0, 4);

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Code': return <Code size={24} className="cat-icon" />;
      case 'Briefcase': return <Briefcase size={24} className="cat-icon" />;
      case 'Cpu': return <Cpu size={24} className="cat-icon" />;
      case 'Activity': return <Activity size={24} className="cat-icon" />;
      case 'Scale': return <Scale size={24} className="cat-icon" />;
      case 'Brain': return <Brain size={24} className="cat-icon" />;
      default: return <FileText size={24} className="cat-icon" />;
    }
  };

  const handleCategoryClick = (majorSlug) => {
    navigate(`/documents?major=${majorSlug}`);
  };

  return (
    <div className="payt-home-page">
      {/* 1. Hero Section - "Dawn of Knowledge" Concept */}
      <section className="home-hero-section sunrise-bg-soft sunrise-glow">
        <div className="container hero-container">
          <div className="hero-badge">
            <span className="sun-dot">●</span> PayT Academic Sharing Platform
          </div>

          <h1 className="hero-headline">
            Discover knowledge <span className="text-highlight">every day</span>
          </h1>

          <p className="hero-subtitle">
            Find verified lecture notes, past exam papers, and study guides that move you forward.
          </p>

          <div className="hero-search-wrap">
            <SearchBar size="lg" placeholder="Search documents, subjects, majors..." />
          </div>

          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="stat-num">50,000+</span>
              <span className="stat-label">Study Materials</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-num">120+</span>
              <span className="stat-label">Universities</span>
            </div>
            <div className="stat-divider"></div>
            <div className="hero-stat-item">
              <span className="stat-num">100%</span>
              <span className="stat-label">Free Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Browse by Major */}
      <section className="home-section browse-major-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Browse by Major</h2>
              <p className="section-subtitle">Explore curated course materials across top academic disciplines</p>
            </div>
            <Link to="/documents" className="section-link">
              View All Majors <ArrowRight size={16} />
            </Link>
          </div>

          <div className="categories-grid">
            {MOCK_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="category-card payt-card payt-card-interactive"
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <div className="category-icon-box">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div className="category-info">
                  <h3 className="category-name">{cat.name}</h3>
                  <p className="category-desc">{cat.description}</p>
                  <span className="category-count">{cat.count} materials</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Popular Documents */}
      <section className="home-section popular-docs-section">
        <div className="container">
          <div className="section-header">
            <div className="title-with-badge">
              <TrendingUp className="text-orange" size={24} />
              <h2 className="section-title">Popular Documents</h2>
            </div>
            <Link to="/documents?sort=popular" className="section-link">
              Browse Popular <ArrowRight size={16} />
            </Link>
          </div>

          <div className="responsive-grid-3">
            {popularDocs.map((doc) => (
              <DocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. Recent Uploads */}
      <section className="home-section recent-uploads-section">
        <div className="container">
          <div className="section-header">
            <div className="title-with-badge">
              <Clock className="text-orange" size={24} />
              <h2 className="section-title">Recent Uploads</h2>
            </div>
            <Link to="/documents?sort=newest" className="section-link">
              See Newest <ArrowRight size={16} />
            </Link>
          </div>

          <div className="payt-card recent-list-card">
            {recentDocs.map((doc, idx) => (
              <div key={doc.id} className={`recent-item ${idx !== recentDocs.length - 1 ? 'has-border' : ''}`}>
                <div className="recent-main-info">
                  <div className="recent-icon">
                    <FileText size={20} className="text-orange" />
                  </div>
                  <div className="recent-text">
                    <Link to={`/documents/${doc.id}`} className="recent-title">
                      {doc.title}
                    </Link>
                    <div className="recent-meta">
                      <span className="badge badge-major">{doc.major}</span>
                      <span>{doc.subject}</span>
                    </div>
                  </div>
                </div>

                <div className="recent-right-info">
                  <span className="recent-date">{formatDate(doc.uploadDate)}</span>
                  <span className="recent-downloads">
                    <Download size={14} /> {doc.downloads}
                  </span>
                  <Link to={`/documents/${doc.id}`} className="view-btn-link">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
