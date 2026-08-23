import { useState, useEffect } from 'react';
import { Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { MAJORS, FILE_TYPES } from '../../utils/constants';
import './DocumentFilter.css';

export const DocumentFilter = ({
  selectedMajors = [],
  selectedTypes = [],
  selectedSubjects = [],
  onFilterChange,
  onClearFilters
}) => {
  const [majorsList, setMajorsList] = useState(selectedMajors);
  const [typesList, setTypesList] = useState(selectedTypes);
  const [subjectsList, setSubjectsList] = useState(selectedSubjects);
  const [expandedSections, setExpandedSections] = useState({
    major: true,
    type: true,
    subject: true
  });

  useEffect(() => {
    setMajorsList(selectedMajors);
  }, [selectedMajors]);

  useEffect(() => {
    setTypesList(selectedTypes);
  }, [selectedTypes]);

  useEffect(() => {
    setSubjectsList(selectedSubjects);
  }, [selectedSubjects]);

  const normalizeStr = (s) => (s ? s.toLowerCase().replace(/[\s-_]+/g, '') : '');

  const isMajorChecked = (major) => {
    const normMajor = normalizeStr(major);
    return majorsList.some((m) => normalizeStr(m) === normMajor);
  };

  const isSubjectChecked = (subj) => {
    const normSubj = normalizeStr(subj);
    return subjectsList.some((s) => normalizeStr(s) === normSubj);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleMajorToggle = (major) => {
    const isChecked = isMajorChecked(major);
    const updated = isChecked
      ? majorsList.filter((m) => normalizeStr(m) !== normalizeStr(major))
      : [...majorsList, major];
    setMajorsList(updated);
    if (onFilterChange) {
      onFilterChange({ majors: updated, types: typesList, subjects: subjectsList });
    }
  };

  const handleTypeToggle = (type) => {
    const updated = typesList.includes(type)
      ? typesList.filter((t) => t !== type)
      : [...typesList, type];
    setTypesList(updated);
    if (onFilterChange) {
      onFilterChange({ majors: majorsList, types: updated, subjects: subjectsList });
    }
  };

  const handleSubjectToggle = (subj) => {
    const isChecked = isSubjectChecked(subj);
    const updated = isChecked
      ? subjectsList.filter((s) => normalizeStr(s) !== normalizeStr(subj))
      : [...subjectsList, subj];
    setSubjectsList(updated);
    if (onFilterChange) {
      onFilterChange({ majors: majorsList, types: typesList, subjects: updated });
    }
  };

  const handleReset = () => {
    setMajorsList([]);
    setTypesList([]);
    setSubjectsList([]);
    if (onClearFilters) onClearFilters();
  };

  return (
    <div className="payt-filter-sidebar payt-card">
      <div className="filter-header">
        <div className="filter-title">
          <Filter size={18} className="filter-icon" />
          <h3>Filters</h3>
        </div>
        <button className="filter-reset-btn" onClick={handleReset}>
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Filter Group: Major */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleSection('major')}>
          <span className="filter-group-title">Major</span>
          {expandedSections.major ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expandedSections.major && (
          <div className="filter-options">
            {MAJORS.map((major) => (
              <label key={major} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={isMajorChecked(major)}
                  onChange={() => handleMajorToggle(major)}
                  className="filter-checkbox"
                />
                <span className="checkbox-text">{major}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter Group: Document Type */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleSection('type')}>
          <span className="filter-group-title">Document Type</span>
          {expandedSections.type ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expandedSections.type && (
          <div className="filter-options">
            {FILE_TYPES.map((type) => (
              <label key={type} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={typesList.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="filter-checkbox"
                />
                <span className="checkbox-text">{type}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filter Group: Subject */}
      <div className="filter-group">
        <div className="filter-group-header" onClick={() => toggleSection('subject')}>
          <span className="filter-group-title">Popular Subjects</span>
          {expandedSections.subject ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expandedSections.subject && (
          <div className="filter-options">
            {['Data Structures', 'Operating Systems', 'Corporate Finance', 'Human Anatomy', 'Constitutional Law'].map((subj) => (
              <label key={subj} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={isSubjectChecked(subj)}
                  onChange={() => handleSubjectToggle(subj)}
                  className="filter-checkbox"
                />
                <span className="checkbox-text">{subj}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentFilter;

