/* globals IMAGINARY */
import formatText from '../helpers-web/format-text';
import DefaultContentOverlay from './default-content-overlay';
import TrainingContentOverlay from './training-content-overlay';
import TrainingPanelComponent from './training-panel-component';

export default class AutostadtNeuralNumbersApp {
  #lang;
  #modeSwitchButtons = {};
  #nnComponent = null;
  #nnTrainingController = null;
  #nnTrainingComponent = null;

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

    this.contentOverlays = {};
    this.currentContentOverlay = null;
  }

  async init() {
    const $content = $('<div></div>')
      .addClass('app-content')
      .appendTo(
        $('<div></div>')
          .addClass('app-frame')
          .appendTo(this.$element)
      );

    this.addContentOverlay('default', new DefaultContentOverlay(), $content);
    this.addContentOverlay('training', new TrainingContentOverlay(), $content);
    this.showContentOverlay('default');

    this.initNavElements($content);
    await this.initNNComponent($content);
    this.setLang(this.config.i18n.defaultLanguage);
    this.switchToDefaultMode();
  }

  initNavElements($container) {
    // Language switcher button
    $('<button />')
      .attr('data-i18n-text', 'ui-langSwitcherButton')
      .attr('id', 'lang-switcher')
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
          this.switchToDefaultMode();
        })
        .appendTo($container),
      training: $('<button />')
        .attr('data-i18n-text', 'nav-trainingMode')
        .addClass('button')
        .on('click', () => {
          this.switchToTrainingMode();
        })
        .appendTo($container),
    };

    $('<div></div>')
      .attr('id', 'mode-switcher')
      .addClass(['button-set'])
      .appendTo($container)
      .append(Object.values(this.#modeSwitchButtons));
  }

  async initNNComponent($container) {
    const $nnContainer = $('<div></div>')
      .attr('id', 'neural-numbers-component')
      .appendTo($container);

    this.#nnComponent = new IMAGINARY.NeuralNumbers(
      $nnContainer,
      {
        modelPath: this.config.ai.modelPath,
        showBars: true,
        showNormalizer: false,
        showTraining: false,
        showOutput: true,
        verticalBars: false,
      }
    );

    this.#nnTrainingController = new IMAGINARY.NeuralNumbersTrainingController(this.#nnComponent, {
      trainingImagePath: this.config.ai.trainingImagePath,
      trainingLabelPath: this.config.ai.trainingLabelPath,
    });

    this.#nnTrainingComponent = new TrainingPanelComponent(
      'training-panel',
      this.config,
      this.#nnComponent,
      this.#nnTrainingController,
    );

    this.$nnTrainingUIContainer = $('<div></div>')
      .attr('id', 'neural-numbers-training-component')
      .append(this.#nnTrainingComponent.$element)
      .appendTo($container);

    await this.#nnComponent.init();
    await this.#nnTrainingController.init();
    await this.#nnTrainingComponent.enableUI();
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

  switchToDefaultMode() {
    this.switchUiToMode('default');
    this.#nnTrainingComponent.hide();
    this.#nnTrainingController.pause();
    this.#nnTrainingController.useDefaultModel();
  }

  switchToTrainingMode() {
    this.switchUiToMode('training');
    this.#nnTrainingComponent.show();
    this.#nnTrainingController.useTrainableModel();
  }

  switchUiToMode(mode) {
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
