const BASE_IMAGE_URL = 'https://ssl.gstatic.com/calendar/images/eventillustrations/v1/';

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
    await this.initI18n();
    await this.loadKeywords();
    this.bindEvents();
    this.renderKeywords();
  }

  async initI18n() {
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
  }

  updateTranslations() {
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
    await i18next.changeLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    this.updateTranslations();

    if (!this.keywordsData[lang]) {
      await this.loadKeywords();
    }
    this.renderKeywords();
  }

  filterKeywords() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const keywords = this.keywordsData[i18next.language] || [];

    this.keywordsList.innerHTML = '';

    keywords
      .filter(({ keyword, related }) => {
        return keyword.toLowerCase().includes(searchTerm) ||
          related.some(rel => rel.toLowerCase().includes(searchTerm));
      })
      .forEach(({ keyword }) => this.createKeywordCard(keyword));
  }

  createKeywordCard(keyword) {
    const keywordData = this.keywordsData[i18next.language].find(item => item.keyword === keyword);
    const clone = this.keywordTemplate.content.cloneNode(true);

    const img = clone.querySelector('.keyword-image');
    const imageFile = keywordData.imageFile || keyword.replace(/\s+/g, '') + '_1x.png';
    img.src = BASE_IMAGE_URL + imageFile;
    img.alt = keyword;

    clone.querySelector('.keyword-text').textContent = keyword;
    clone.querySelector('.related-keywords').textContent =
      `${i18next.t('app.related')}: ${keywordData.related.join(', ')}`;

    this.keywordsList.appendChild(clone);
  }

  renderKeywords() {
    this.keywordsList.innerHTML = '';
    const keywords = this.keywordsData[i18next.language] || [];
    keywords.forEach(({ keyword }) => this.createKeywordCard(keyword));
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new KeywordExplorer();
});
