import formatText from '../helpers-web/format-text';
import DefaultContentOverlay from './default-content-overlay';
import TrainingContentOverlay from './training-content-overlay';

export default class AutostadtNeuralNumbersApp {
  #lang;
  #modeSwitchButtons = {};

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

    this.contentOverlays = {};
    this.currentContentOverlay = null;

    this.addContentOverlay('default', new DefaultContentOverlay(), $frame);
    this.addContentOverlay('training', new TrainingContentOverlay(), $frame);
    this.showContentOverlay('default');

    this.initNavElements($frame);
    this.setLang(config.i18n.defaultLanguage);
    this.switchToMode('default');
  }

  initNavElements($container) {
    // Language switcher button
    $('<button />')
      .attr('data-i18n-text', 'ui-langSwitcherButton')
      .addClass('button')
      .on('click', () => {
        this.toggleLang();
      })
      .appendTo($container);

    this.#modeSwitchButtons = {
      default: $('<button />')
        .attr('data-i18n-text', 'nav-defaultMode')
        .addClass('button')
        .on('click', () => {
          this.switchToMode('default');
        })
        .appendTo($container),
      training: $('<button />')
        .attr('data-i18n-text', 'nav-trainingMode')
        .addClass('button')
        .on('click', () => {
          this.switchToMode('training');
        })
        .appendTo($container),
    };

    $('<div></div>')
      .addClass('button-set')
      .appendTo($container)
      .append(Object.values(this.#modeSwitchButtons));
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

  switchToMode(mode) {
    if (!this.contentOverlays[mode]) {
      throw new Error(`Attempt to switch to invalid mode: ${mode}`);
    }
    this.showContentOverlay(mode);
    Object.values(this.#modeSwitchButtons).forEach(($button) => {
      $button.removeClass('active');
    });
    this.#modeSwitchButtons[mode].addClass('active');
  }

  addContentOverlay(name, contentOverlay, $container) {
    this.contentOverlays[name] = contentOverlay;
    contentOverlay.$element.hide();
    $container.append(contentOverlay.$element);
  }

  showContentOverlay(name) {
    if (this.currentContentOverlay) {
      this.currentContentOverlay.$element.hide();
    }
    this.currentContentOverlay = this.contentOverlays[name];
    this.currentContentOverlay.$element.show();
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
