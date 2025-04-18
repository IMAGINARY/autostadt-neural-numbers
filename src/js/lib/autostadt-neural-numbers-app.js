import formatText from '../helpers-web/format-text';

export default class AutostadtNeuralNumbersApp {
  #lang;

  constructor(config) {
    this.config = config;
    this.width = config.app.display.width ?? 1920;
    this.height = config.app.display.height ?? 1080;

    this.$element = $('<div></div>')
      .addClass(['autostadt-neural-numbers-app', 'app'])
      .css({
        width: this.width,
        height: this.height,
      });

    const $frame = $('<div></div>')
      .addClass('app-frame')
      .appendTo(this.$element);

    this.initTextElements($frame);
    this.initNavElements($frame);
    this.setLang(config.i18n.defaultLanguage);
  }

  setLang(code) {
    if (!this.config.i18n.languages[code]) {
      throw new Error(`Trying to swtich language to '${code}', which is not included in config.i18n.languages`);
    }
    this.#lang = code;
    this.updateTexts();
  }

  getLang() {
    return this.#lang;
  }

  toggleLang() {
    const langCodes = Object.keys(this.config.i18n.languages);
    const currentLangIndex = langCodes.indexOf(this.#lang);
    const nextLangIndex = (currentLangIndex + 1) % langCodes.length;
    this.setLang(langCodes[nextLangIndex]);
  }

  // eslint-disable-next-line class-methods-use-this
  initTextElements($container) {
    $('<h1>')
      .attr('data-i18n-text', 'defaultMode-title')
      .appendTo($container);

    $('<p>')
      .attr('data-i18n-text', 'defaultMode-body')
      .appendTo($container);
  }

  initNavElements($container) {
    $('<button />')
      .attr('data-i18n-text', 'ui-langSwitcherButton')
      .addClass('button')
      .on('click', () => {
        this.toggleLang();
      })
      .appendTo($container);
  }

  updateTexts() {
    const strings = this.config.i18n.strings[this.#lang];
    this.$element.find('[data-i18n-text]').each((_, el) => {
      const $el = $(el);
      const textKey = $el.data('i18n-text');
      if (strings[textKey]) {
        $el.html(formatText(strings[textKey]));
      }
    });
  }
}
