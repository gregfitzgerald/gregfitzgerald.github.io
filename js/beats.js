/**
 * Beats - Inline activity badges for greg-fitzgerald.com
 * Inspired by Simon Willison's beats implementation
 */

(function() {
  'use strict';

  const BEATS_URL = '/data/beats.json';
  
  // Beat type configurations
  const BEAT_TYPES = {
    paper: {
      label: 'Paper',
      icon: '📄',
      className: 'beat-paper',
      linkPrefix: '' // Zotero/DOI links are absolute
    },
    code: {
      label: 'Code',
      icon: '💻',
      className: 'beat-code',
      linkPrefix: ''
    },
    thought: {
      label: 'Thought',
      icon: '💭',
      className: 'beat-thought',
      linkPrefix: ''
    },
    til: {
      label: 'TIL',
      icon: '💡',
      className: 'beat-til',
      linkPrefix: ''
    }
  };

  /**
   * Format a date for display
   */
  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  /**
   * Create a beat element
   */
  function createBeatElement(beat) {
    const config = BEAT_TYPES[beat.type] || BEAT_TYPES.til;
    
    const article = document.createElement('article');
    article.className = `beat ${config.className}`;
    article.dataset.beatId = beat.id;
    article.dataset.beatDate = beat.date;
    
    const badge = document.createElement('span');
    badge.className = 'beat-badge';
    badge.textContent = config.icon + ' ' + config.label;
    
    const content = document.createElement('span');
    content.className = 'beat-content';
    
    if (beat.url) {
      const link = document.createElement('a');
      link.href = beat.url;
      link.textContent = beat.title;
      link.target = '_blank';
      link.rel = 'noopener';
      content.appendChild(link);
    } else {
      content.textContent = beat.title;
    }
    
    // Add description if present and not too long
    if (beat.description && beat.description.length < 150) {
      const desc = document.createElement('span');
      desc.className = 'beat-description';
      desc.textContent = ' — ' + beat.description;
      content.appendChild(desc);
    }
    
    const meta = document.createElement('span');
    meta.className = 'beat-meta';
    meta.textContent = formatDate(beat.date);
    
    // Add source indicator for certain types
    if (beat.source) {
      const source = document.createElement('span');
      source.className = 'beat-source';
      source.textContent = ' · ' + beat.source;
      meta.appendChild(source);
    }
    
    article.appendChild(badge);
    article.appendChild(content);
    article.appendChild(meta);
    
    return article;
  }

  /**
   * Render beats into a container
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Rendering options
   */
  function renderBeats(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const {
      limit = 10,
      types = null,  // null = all types, or array like ['paper', 'code']
      startDate = null,
      endDate = null,
      showEmpty = false
    } = options;

    fetch(BEATS_URL)
      .then(response => {
        if (!response.ok) throw new Error('Failed to load beats');
        return response.json();
      })
      .then(data => {
        let beats = data.beats || [];
        
        // Filter by type
        if (types && Array.isArray(types)) {
          beats = beats.filter(b => types.includes(b.type));
        }
        
        // Filter by date range
        if (startDate) {
          beats = beats.filter(b => new Date(b.date) >= new Date(startDate));
        }
        if (endDate) {
          beats = beats.filter(b => new Date(b.date) <= new Date(endDate));
        }
        
        // Sort by date (newest first)
        beats.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Apply limit
        if (limit > 0) {
          beats = beats.slice(0, limit);
        }
        
        // Render
        if (beats.length === 0) {
          if (showEmpty) {
            container.innerHTML = '<p class="beats-empty">No recent activity.</p>';
          }
          return;
        }
        
        container.innerHTML = '';
        beats.forEach(beat => {
          container.appendChild(createBeatElement(beat));
        });
      })
      .catch(error => {
        console.error('Beats error:', error);
        if (showEmpty) {
          container.innerHTML = '<p class="beats-error">Could not load activity.</p>';
        }
      });
  }

  /**
   * Render beats interleaved with existing content (for timeline views)
   * @param {string} containerId - ID of container with existing posts
   * @param {Object} options - Rendering options
   */
  function interleaveBeats(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    fetch(BEATS_URL)
      .then(response => response.json())
      .then(data => {
        const beats = data.beats || [];
        if (beats.length === 0) return;

        // Get existing posts with their dates
        const posts = container.querySelectorAll('[data-post-date]');
        const postDates = Array.from(posts).map(p => ({
          element: p,
          date: new Date(p.dataset.postDate)
        }));

        // Insert beats at appropriate positions
        beats.forEach(beat => {
          const beatDate = new Date(beat.date);
          const beatEl = createBeatElement(beat);
          
          // Find the right position
          let inserted = false;
          for (const post of postDates) {
            if (beatDate > post.date) {
              post.element.parentNode.insertBefore(beatEl, post.element);
              inserted = true;
              break;
            }
          }
          
          // If not inserted, append at end
          if (!inserted && postDates.length > 0) {
            container.appendChild(beatEl);
          }
        });
      })
      .catch(error => console.error('Beats interleave error:', error));
  }

  // Expose public API
  window.Beats = {
    render: renderBeats,
    interleave: interleaveBeats,
    TYPES: BEAT_TYPES
  };

  // Auto-initialize containers with data-beats attribute
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-beats]').forEach(container => {
      const options = {};
      
      if (container.dataset.beatsLimit) {
        options.limit = parseInt(container.dataset.beatsLimit, 10);
      }
      if (container.dataset.beatsTypes) {
        options.types = container.dataset.beatsTypes.split(',').map(t => t.trim());
      }
      if (container.dataset.beatsShowEmpty !== undefined) {
        options.showEmpty = true;
      }
      
      renderBeats(container.id, options);
    });
  });

})();
