const IMAGE_URL = 'https://ssl.gstatic.com/calendar/images/eventillustrations/v1/';
const IMAGE_PREFIX = 'img_';
const IMAGE_SUFFIX = '_1x.jpg';

class KeywordExplorer {
  constructor() {
    this.searchInput = document.getElementById('searchInput');
    this.keywordsList = document.getElementById('keywordsList');
    this.langSelect = document.getElementById('langSelect');
    this.keywordTemplate = document.getElementById('keywordTemplate');
    this.keywordsData = {};

    this.init();
  }

  async init() {
    try {
      await this.initI18n();
      await this.loadKeywords();
      this.bindEvents();
      this.renderKeywords();
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

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
            loadPath: 'locale/translations/{{lng}}.json'
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

      // Initialize translations
      this.updateTranslations();
    } catch (error) {
      console.error('Error initializing i18n:', error);
    }
  }

  updateTranslations() {
    try {
      // Update title
      document.title = i18next.t('app.title');

      // Update all elements with data-i18n attribute
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key.startsWith('[')) {
          // Handle attributes like [placeholder]app.searchPlaceholder
          const match = key.match(/\[(.*?)\](.*)/);
          if (match) {
            const attr = match[1];
            const i18nKey = match[2];
            element.setAttribute(attr, i18next.t(i18nKey));
          }
        } else {
          // Handle text content
          element.textContent = i18next.t(key);
        }
      });
    } catch (error) {
      console.error('Error updating translations:', error);
    }
  }

  async loadKeywords() {
    try {
      const response = await fetch(`locale/keywords/${i18next.language}.json`);
      const keywords = await response.json();
      this.keywordsData[i18next.language] = keywords;
    } catch (error) {
      console.error(`Error loading keywords for ${i18next.language}:`, error);
      // If loading fails, try loading English as fallback
      if (i18next.language !== 'en') {
        const fallbackResponse = await fetch('locale/keywords/en.json');
        this.keywordsData[i18next.language] = await fallbackResponse.json();
      }
    }
  }

  bindEvents() {
    this.searchInput.addEventListener('input', () => this.filterKeywords());
    this.langSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  }

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
      // Fallback to default language
      this.changeLanguage('en');
    }
  }

  filterKeywords() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();
    const keywords = this.keywordsData[i18next.language] || [];

    // Early return if no search term
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
  }

  createKeywordCard(keyword) {
    const keywordData = this.keywordsData[i18next.language]?.find(item => item.keyword === keyword);
    if (!keywordData) return;

    const clone = this.keywordTemplate.content.cloneNode(true);
    const card = clone.querySelector('.card');
    const img = clone.querySelector('.keyword-image');
    const keywordText = clone.querySelector('.keyword-text');
    const relatedKeywords = clone.querySelector('.related-keywords');

    try {
      // Handle image loading
      const imageFile = IMAGE_PREFIX + (keywordData.imageFile || keyword.replace(/\s+/g, '')) + IMAGE_SUFFIX;
      img.src = IMAGE_URL + imageFile;
      img.alt = keyword;
      img.onerror = () => {
        img.src = 'https://placehold.co/448x192?text=' + encodeURIComponent(keyword);
      };

      keywordText.textContent = keyword;
      relatedKeywords.textContent = keywordData.related
        ? `${i18next.t('app.related')}: ${keywordData.related.join(', ')}`
        : i18next.t('app.noRelatedKeywords');

      this.keywordsList.appendChild(clone);
    } catch (error) {
      console.error('Error creating keyword card:', error);
    }
  }

  renderKeywords() {
    try {
      this.keywordsList.innerHTML = '';
      const keywords = this.keywordsData[i18next.language] || [];

      // Sort keywords alphabetically
      keywords.sort((a, b) => a.keyword.localeCompare(b.keyword));

      keywords.forEach(({ keyword }) => this.createKeywordCard(keyword));
    } catch (error) {
      console.error('Error rendering keywords:', error);
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  try {
    new KeywordExplorer();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
});
