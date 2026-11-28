import React, { useState, useEffect, useRef, useMemo } from 'react';
import { moviesData, subscribeMoviesChange } from '../../../../server/src/data/moviesData';
import { hasScheduleTag } from '../../../../server/src/data/movieSelectors';
import { removeVietnameseTones } from '../../../../server/src/data/cinemasData';
import './SearchBar.css';

const STORAGE_KEY = 'ptit_cine_recent_searches_v1';
const MAX_HISTORY_ITEMS = 5;

const DEFAULT_RECENT_SEARCHES = [
  'hành động',
  'Oppenheimer',
  'Dune: Hành Tinh Cát',
  'Đào, Phở và Piano',
  'Kinh dị'
];

export default function SearchBar({
  initialQuery = '',
  onSearch,
  onSelectMovie
}) {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [moviesVersion, setMoviesVersion] = useState(0);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_HISTORY_ITEMS);
        }
      }
    } catch (e) {
      console.error('Error reading search history:', e);
    }
    return DEFAULT_RECENT_SEARCHES.slice(0, MAX_HISTORY_ITEMS);
  });

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync query prop when external query changes
  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  // Listen for movie updates by Admin
  useEffect(() => {
    return subscribeMoviesChange(() => {
      setMoviesVersion((v) => v + 1);
    });
  }, []);

  // Persist history to localStorage (always max 5 items)
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(recentSearches.slice(0, MAX_HISTORY_ITEMS))
      );
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  }, [recentSearches]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save a search term to history (deduplicated, max 5 rows)
  const addSearchToHistory = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      );
      return [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  // Delete an item from history when clicking the "x" button on the right
  const handleDeleteHistoryItem = (e, itemToDelete) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches((prev) =>
      prev.filter((item) => item !== itemToDelete)
    );
  };

  // Trigger search navigation
  const executeSearch = (searchTerm) => {
    const cleaned = (searchTerm || '').trim();
    if (!cleaned) return;

    setQuery(cleaned);
    addSearchToHistory(cleaned);
    setIsOpen(false);
    if (onSearch) {
      onSearch(cleaned);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Filter related movies/keywords while typing (supports both accented & unaccented Vietnamese)
  const trimmedQuery = query.trim().toLowerCase();
  const normalizedNoTone = removeVietnameseTones(trimmedQuery);

  const relatedMovies = useMemo(() => {
    if (!trimmedQuery) return [];
    return moviesData
      .filter((m) => hasScheduleTag(m))
      .filter((m) => {
        const title = (m.title || '').toLowerCase();
        const originalTitle = (m.originalTitle || '').toLowerCase();
        const genre = (m.genre || '').toLowerCase();
        const director = (m.director || '').toLowerCase();
        const cast = (m.cast || '').toLowerCase();
        const origin = (m.origin || '').toLowerCase();
        const tags = Array.isArray(m.tags) ? m.tags.join(' ').toLowerCase() : '';

        const directMatch =
          title.includes(trimmedQuery) ||
          originalTitle.includes(trimmedQuery) ||
          genre.includes(trimmedQuery) ||
          director.includes(trimmedQuery) ||
          cast.includes(trimmedQuery) ||
          origin.includes(trimmedQuery) ||
          tags.includes(trimmedQuery);

        if (directMatch) return true;

        if (!normalizedNoTone) return false;
        const combinedNoTone = removeVietnameseTones(
          `${m.title || ''} ${m.originalTitle || ''} ${m.genre || ''} ${m.director || ''} ${m.cast || ''} ${m.origin || ''}`
        );
        return combinedNoTone.includes(normalizedNoTone);
      })
      .slice(0, 5);
  }, [trimmedQuery, normalizedNoTone, moviesVersion]);

  const displayedHistory = recentSearches.slice(0, MAX_HISTORY_ITEMS);

  return (
    <div ref={containerRef} className="sb-engine-container">
      <form onSubmit={handleFormSubmit} className="sb-engine-form">
        <span className="sb-engine-icon-left" aria-hidden="true">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder="Tìm kiếm phim, thể loại..."
          aria-label="Tìm kiếm phim"
          className="sb-engine-input"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            title="Xóa ô nhập"
            className="sb-engine-clear-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </form>

      {/* Dropdown menu on click / focus */}
      {isOpen && (
        <div className="sb-engine-dropdown">
          {/* Previously searched items - Max 5 rows with "x" button on the right */}
          <div className="sb-engine-section">
            <div className="sb-engine-section-head">
              {/*<span>Tìm kiếm gần đây (Tối đa 5)</span>*/}
              {displayedHistory.length > 0 && (
                <span className="sb-engine-counter">
                  {displayedHistory.length}/5
                </span>
              )}
            </div>

            {displayedHistory.length === 0 ? (
              <div className="sb-engine-empty-history">
                Chưa có lịch sử tìm kiếm
              </div>
            ) : (
              <ul className="sb-engine-history-list">
                {displayedHistory.map((item) => (
                  <li
                    key={item}
                    onClick={() => executeSearch(item)}
                    className="sb-engine-history-item"
                  >
                    <div className="sb-engine-history-left">
                      <svg
                        className="sb-engine-item-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="sb-engine-history-text">{item}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistoryItem(e, item)}
                      aria-label={`Xóa ${item} khỏi lịch sử`}
                      title="Xóa tìm kiếm này"
                      className="sb-engine-history-del"
                    >
                      x
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Related keywords / direct search navigation when typing */}
          {trimmedQuery && (
            <div className="sb-engine-related-section">
              <div className="sb-engine-section-head">
                <span>Từ khóa liên quan</span>
              </div>

              {/* Action row to navigate to search page for current query */}
              <button
                type="button"
                onClick={() => executeSearch(query)}
                className="sb-engine-direct-search-btn"
              >
                <span className="sb-engine-direct-text">
                  Tìm kiếm cho &lsquo;{query.trim()}&rsquo;
                </span>
                <svg
                  className="sb-engine-arrow-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </button>

              {relatedMovies.length > 0 && (
                <ul className="sb-engine-related-list">
                  {relatedMovies.map((movie) => (
                    <li
                      key={movie.id}
                      onClick={() => {
                        addSearchToHistory(movie.title);
                        setIsOpen(false);
                        setQuery(movie.title);
                        if (onSearch) {
                          onSearch(movie.title);
                        } else if (onSelectMovie) {
                          onSelectMovie(movie);
                        }
                      }}
                      className="sb-engine-related-item"
                    >
                      <div className="sb-engine-related-left">
                        <svg
                          className="sb-engine-item-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                          <line x1="7" y1="2" x2="7" y2="22" />
                          <line x1="17" y1="2" x2="17" y2="22" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <line x1="2" y1="7" x2="7" y2="7" />
                          <line x1="2" y1="17" x2="7" y2="17" />
                          <line x1="17" y1="17" x2="22" y2="17" />
                          <line x1="17" y1="7" x2="22" y2="7" />
                        </svg>
                        <div className="sb-engine-related-info">
                          <span className="sb-engine-related-title">{movie.title}</span>
                          <span className="sb-engine-related-genre">{movie.genre}</span>
                        </div>
                      </div>
                      <span className="sb-engine-related-date">
                        {movie.releaseDate}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
