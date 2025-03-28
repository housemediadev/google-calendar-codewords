// Constants for image URLs
// Updated to 2024 version for better image quality
const IMAGE_URL = 'https://ssl.gstatic.com/calendar/images/eventillustrations/2024_v2/';
const IMAGE_PREFIX = 'img_';
const IMAGE_SUFFIX = '.svg';

/**
 * Main application class for managing keyword exploration
 * Handles UI rendering, keyword filtering, and internationalization
 */
class KeywordExplorer {
  constructor() {
    /**
     * Initialize DOM elements and data structures
     * @property {HTMLElement} searchInput - Input element for keyword search
     * @property {HTMLElement} keywordsList - Container for keyword cards
     * @property {HTMLElement} langSelect - Language selection dropdown
     * @property {HTMLElement} keywordTemplate - Template for keyword cards
     * @property {Object} keywordsData - Stores keyword data by language
     */
    this.searchInput = document.getElementById('searchInput');
    this.keywordsList = document.getElementById('keywordsList');
    this.langSelect = document.getElementById('langSelect');
    this.keywordTemplate = document.getElementById('keywordTemplate');
    this.keywordsData = {};

    this.init();
  }

  /**
   * Initialize the application by setting up i18n, loading keywords, and binding events
   */
  async init() {
    try {
      await this.initI18n();
      await this.loadKeywords();
      this.bindEvents();
      this.renderKeywords();
      this.initializeLazyLoading();
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  /**
   * Initialize i18next for internationalization
   * Sets up language detection and translation loading
   */
  async initI18n() {
    try {
      await i18next
        .use(i18nextBrowserLanguageDetector)
        .use(i18nextHttpBackend)
        .init({
          fallbackLng: 'en',
          supportedLngs: ['en', 'es'],
          debug: true,
          backend: {
            loadPath: 'locales/translations/{{lng}}.json'
          },
          interpolation: {
            escapeValue: false
          }
        });

      // Set initial language from browser or localStorage
      const savedLang = localStorage.getItem('preferredLanguage') || i18next.language;
      const validLang = ['en', 'es'].includes(savedLang) ? savedLang : 'en';
      await this.changeLanguage(validLang);
      this.langSelect.value = validLang;

      this.updateTranslations();
    } catch (error) {
      console.error('Error initializing i18n:', error);
    }
  }

  /**
   * Update translations for all elements with data-i18n attributes
   * Handles both text content and attribute translations
   */
  updateTranslations() {
    try {
      document.title = i18next.t('app.title');

      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key.startsWith('[')) {
          // Handle attribute translations like [placeholder]app.searchPlaceholder
          const match = key.match(/\[(.*?)\](.*)/);
          if (match) {
            const attr = match[1];
            const i18nKey = match[2];
            element.setAttribute(attr, i18next.t(i18nKey));
          }
        } else {
          element.textContent = i18next.t(key);
        }
      });
    } catch (error) {
      console.error('Error updating translations:', error);
    }
  }

  /**
   * Load keywords data for the current language
   * Falls back to English if loading fails
   */
  async loadKeywords() {
    try {
      const response = await fetch(`locales/keywords/${i18next.language}.json`);
      const keywords = await response.json();
      this.keywordsData[i18next.language] = keywords;
    } catch (error) {
      console.error(`Error loading keywords for ${i18next.language}:`, error);

      // Fallback to English if current language fails
      if (i18next.language !== 'en') {
        const fallbackResponse = await fetch('locales/keywords/en.json');
        this.keywordsData[i18next.language] = await fallbackResponse.json();
      }
    }
  }

  /**
   * Bind event listeners for search and language change
   */
  bindEvents() {
    this.searchInput.addEventListener('input', () => this.filterKeywords());
    this.langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  }

  /**
   * Change application language and update translations
   * @param {string} lang - Language code (en/es)
   */
  async changeLanguage(lang) {
    try {
      await i18next.changeLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
      this.updateTranslations();

      if (!this.keywordsData[lang]) {
        await this.loadKeywords();
      }
      this.renderKeywords();
    } catch (error) {
      console.error('Error changing language:', error);
      this.changeLanguage('en');
    }
  }

  /**
   * Filter keywords based on search input
   * Shows cards that match the search term in keyword or related keywords
   */
  filterKeywords() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const keywords = this.keywordsData[i18next.language] || [];

    if (!searchTerm) {
      this.renderKeywords();
      return;
    }

    this.keywordsList.innerHTML = '';

    const filteredKeywords = keywords
      .filter(({ keyword, related }) => {
        return keyword.toLowerCase().includes(searchTerm) ||
          (related && related.some(rel => rel.toLowerCase().includes(searchTerm)));
      });

    // Sort results by relevance (matching keyword first)
    filteredKeywords.sort((a, b) => {
      const aMatch = a.keyword.toLowerCase().includes(searchTerm);
      const bMatch = b.keyword.toLowerCase().includes(searchTerm);
      return bMatch - aMatch;
    });

    filteredKeywords.forEach(({ keyword }) => this.createKeywordCard(keyword));
    this.observeImages();
  }

  /**
   * Create and append a keyword card to the list
   * @param {string} keyword - The keyword to display
   */
  createKeywordCard(keyword) {
    const keywordData = this.keywordsData[i18next.language]?.find(item => item.keyword === keyword);
    if (!keywordData) return;

    const clone = this.keywordTemplate.content.cloneNode(true);
    const img = clone.querySelector('.keyword-image');
    const keywordText = clone.querySelector('.keyword-text');
    const relatedKeywordsContainer = clone.querySelector('.related-keywords-container');
    const relatedKeywords = clone.querySelector('.related-keywords');

    try {
      img.dataset.src = IMAGE_URL + IMAGE_PREFIX + keywordData.slug + IMAGE_SUFFIX;
      img.alt = keyword;

      keywordText.textContent = keyword;

      // Show related keywords if they exist
      if (keywordData.related && keywordData.related.length > 0) {
        relatedKeywords.textContent = `${i18next.t('app.related')}: ${keywordData.related.join(', ')}`;
        relatedKeywordsContainer.style.display = 'block';
      } else {
        relatedKeywordsContainer.style.display = 'none';
      }

      this.keywordsList.appendChild(clone);
      this.observeImages();
    } catch (error) {
      console.error('Error creating keyword card:', error);
    }
  }

  /**
   * Render all keywords in alphabetical order
   */
  renderKeywords() {
    this.keywordsList.innerHTML = '';
    const keywords = this.keywordsData[i18next.language] || [];

    keywords.sort((a, b) => a.keyword.localeCompare(b.keyword));

    // Move 'xmas' to the end
    keywords.sort((a, b) => {
      if (a.keyword.toLowerCase().includes('xmas')) {
        return 1;
      }

      if (b.keyword.toLowerCase().includes('xmas')) {
        return -1;
      }

      return 0;
    });

    keywords.forEach(({ keyword }) => this.createKeywordCard(keyword));
  }

  /**
   * Initialize lazy loading for images
   * Uses Intersection Observer for better performance
   */
  initializeLazyLoading() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.add('loaded');
            this.observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '100px',
      threshold: 0
    });

    this.observeImages();
  }

  /**
   * Observe all lazy images
   */
  observeImages() {
    if (this.observer) {
      document.querySelectorAll('.keyword-image').forEach(img => {
        if (img.dataset.src && !img.src) {
          this.observer.observe(img);
        }
      });
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    new KeywordExplorer();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});
