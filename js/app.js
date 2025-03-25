class KeywordExplorer {
  constructor() {
    this.currentLang = 'es';
    this.searchInput = document.getElementById('searchInput');
    this.keywordsList = document.getElementById('keywordsList');
    this.toggleLangBtn = document.getElementById('toggleLang');
    this.keywordTemplate = document.getElementById('keywordTemplate');

    this.keywordsData = {
      "en": [],
      "es": []
    };

    this.init();
  }

  async init() {
    await this.loadKeywords();
    this.bindEvents();
    this.renderKeywords();
    this.updatePlaceholder();
  }

  async loadKeywords() {
    const enResponse = await fetch('js/keywords_en.json');
    const esResponse = await fetch('js/keywords_es.json');
    this.keywordsData.en = await enResponse.json();
    this.keywordsData.es = await esResponse.json();
  }

  bindEvents() {
    this.searchInput.addEventListener('input', () => this.filterKeywords());
    this.toggleLangBtn.addEventListener('click', () => this.toggleLanguage());
  }

  toggleLanguage() {
    this.currentLang = this.currentLang === 'es' ? 'en' : 'es';
    this.updatePlaceholder();
    this.renderKeywords();
  }

  updatePlaceholder() {
    this.searchInput.placeholder = this.currentLang === 'es' ?
      'Buscar palabras clave...' : 'Search keywords...';
  }

  filterKeywords() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const keywords = this.keywordsData[this.currentLang];

    this.keywordsList.innerHTML = '';

    keywords
      .filter(({ keyword, related }) => {
        return keyword.toLowerCase().includes(searchTerm) ||
          related.some(rel => rel.toLowerCase().includes(searchTerm));
      })
      .forEach(({ keyword }) => this.createKeywordCard(keyword));
  }

  createKeywordCard(keyword) {
    const keywordData = this.keywordsData[this.currentLang].find(item => item.keyword === keyword);
    const clone = this.keywordTemplate.content.cloneNode(true);

    const img = clone.querySelector('.keyword-image');
    img.src = BASE_IMAGE_URL + keywordData.keyword.replace(/\s+/g, '') + IMAGE_SUFFIX;
    img.alt = keyword;

    clone.querySelector('.keyword-text').textContent = keyword;
    clone.querySelector('.related-keywords').textContent =
      `${this.currentLang === 'es' ? 'Relacionados' : 'Related'}: ${keywordData.related.join(', ')}`;

    this.keywordsList.appendChild(clone);
  }

  renderKeywords() {
    this.keywordsList.innerHTML = '';
    this.keywordsData[this.currentLang].forEach(({ keyword }) => this.createKeywordCard(keyword));
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new KeywordExplorer();
});
