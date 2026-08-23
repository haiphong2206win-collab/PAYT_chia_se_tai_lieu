import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import './SearchBar.css';

export const SearchBar = ({
  placeholder = 'Search documents, subjects, majors...',
  size = 'lg',
  initialValue = '',
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      const searchParam = query.trim() ? `?search=${encodeURIComponent(query.trim())}` : '';
      navigate(`/documents${searchParam}`);
    }
  };

  return (
    <form className={`payt-searchbar payt-searchbar-${size} ${className}`} onSubmit={handleSubmit}>
      <div className="payt-searchbar-input-wrap">
        <Search className="payt-searchbar-icon" size={size === 'lg' ? 22 : 18} />
        <input
          type="text"
          className="payt-searchbar-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size={size === 'lg' ? 'lg' : 'md'}
        className="payt-searchbar-btn"
      >
        Search
      </Button>
    </form>
  );
};

export default SearchBar;
