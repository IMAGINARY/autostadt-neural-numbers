/* globals IMAGINARY */
import formatText from '../helpers-web/format-text';
import DefaultContentOverlay from './default-content-overlay';
import TrainingContentOverlay from './training-content-overlay';
import TrainingPanelComponent from './training-panel-component';

export default class AutostadtNeuralNumbersApp {
  /**
   * Configuration object for the application.
   * @type {Object}
   */
  config;
  /**
   * Width of the application display.
   * @type {number}
   */
  width;
  /**
   * Height of the application display.
   * @type {number}
   */
  height;
  /**
   * Root jQuery element of the application.
   * @type {JQuery|null}
   */
  $element = null;
  /**
   * Current language code for the application.
   * @type {string}
   * @private
   */
  #lang = 'en';
  /**
   * Buttons for switching modes in the application.
   * @type {Object<string, JQuery>}
   * @private
   */
  #modeSwitchButtons = {};
  /**
   * Neural Numbers component instance.
   * @type {NeuralNumbersComponent|null}
   * @private
   */
  #nnComponent = null;
  /**
   * Neural Numbers training controller instance.
   * @type {NeuralNumbersTrainingController|null}
   * @private
   */
  #nnTrainingController = null;
  /**
   * Neural Numbers training panel component instance.
   * @type {TrainingPanelComponent|null}
   * @private
   */
  #nnTrainingComponent = null;
  /**
   * jQuery element for the content area of the application.
   * @type {JQuery|null}
   * @private
   */
  #$content;
  /**
   * jQuery element for the input box label.
   * @type {JQuery|null}
   * @private
   */
  #$inputBoxLabel;
  /**
   * jQuery element for the output box label.
   * @type {JQuery|null}
   * @private
   */
  #$outputBoxLabel;
  /**
   * Content overlays for different application modes.
   * @type {Object<string, DefaultContentOverlay|TrainingContentOverlay>}
   * @private
   */
  #contentOverlays = {};
  /**
   * Currently active content overlay.
   * @type {DefaultContentOverlay|TrainingContentOverlay|null}
   * @private
   */
  #currentContentOverlay = null;
  /**
   * Indicates whether the application is in a mode transition.
   * @type {boolean}
   * @private
   */
  #inModeTransition = false;

  /**
   * Constructor
   *
   * @param {Object} config
   *  Configuration object for the application.
   */
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

    this.#$content = $('<div></div>')
      .addClass('app-content')
      .appendTo(
        $('<div></div>')
          .addClass('app-frame')
          .appendTo(this.$element)
      );

    this.addContentOverlay('default', new DefaultContentOverlay(), this.#$content);
    this.addContentOverlay('training', new TrainingContentOverlay(), this.#$content);
    this.showContentOverlay('default');

    this.#$inputBoxLabel = $('<div></div>')
      .attr('id', 'input-box-label')
      .attr('data-i18n-text', 'ui-inputPanelLabel')
      .addClass('box-label')
      .appendTo(this.$element);

    this.#$outputBoxLabel = $('<div></div>')
      .attr('id', 'output-box-label')
      .attr('data-i18n-text', 'ui-outputPanelLabel')
      .addClass('box-label')
      .appendTo(this.$element);

    this.initNavElements(this.#$content);
  }

  /**
   * Initializes the application.
   *
   * @return {Promise<void>}
   */
  async init() {
    await this.initNNComponent(this.#$content);
    this.setLang(this.config.i18n.defaultLanguage);
    this.switchToDefaultMode();
  }

  /**
   * Initializes the navigation elements of the application.
   *
   * @private
   * @param {JQuery} $container
   */
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

  /**
   * Initializes the Neural Numbers component.
   *
   * @private
   * @param $container
   * @return {Promise<void>}
   */
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
      this.#nnTrainingController
    );

    $('<div></div>')
      .attr('id', 'neural-numbers-training-component')
      .append(this.#nnTrainingComponent.$element)
      .appendTo($container);

    await this.#nnComponent.init();
    await this.#nnTrainingController.init();
    await this.#nnTrainingComponent.enableUI();
  }

  /**
   * Sets the language for the application.
   *
   * @param {string} code
   *  Language code to set.
   */
  setLang(code) {
    if (!this.config.i18n.languages[code]) {
      throw new Error(`Trying to swtich language to '${code}', which is not included in config.i18n.languages`);
    }
    this.#lang = code;
    this.updateTexts();
  }

  /**
   * Gets the current language of the application.
   *
   * @return {string}
   */
  getLang() {
    return this.#lang;
  }

  /**
   * Toggles the language of the application.
   */
  toggleLang() {
    const langCodes = Object.keys(this.config.i18n.languages);
    const currentLangIndex = langCodes.indexOf(this.#lang);
    const nextLangIndex = (currentLangIndex + 1) % langCodes.length;
    this.setLang(langCodes[nextLangIndex]);
  }

  /**
   * Switches the application to default mode.
   */
  switchToDefaultMode() {
    if (this.#inModeTransition) {
      return;
    }
    this.#inModeTransition = true;
    this.switchUiToMode('default');
    this.#nnTrainingComponent.hide().then(() => {
      this.#nnTrainingController.pause();
      this.#nnTrainingController.useDefaultModel();
      this.#inModeTransition = false;
    });
  }

  /**
   * Switches the application to training mode.
   */
  switchToTrainingMode() {
    if (this.#inModeTransition) {
      return;
    }
    this.#inModeTransition = true;
    this.switchUiToMode('training');
    this.#nnTrainingComponent.show().then(() => {
      this.#nnTrainingController.useTrainableModel();
      this.#inModeTransition = false;
    });
  }

  /**
   * Switches the app's UI to a specific mode.
   *
   * @private
   * @param {string} mode
   *  Mode to switch to (either 'default' or 'training').
   */
  switchUiToMode(mode) {
    if (!this.#contentOverlays[mode]) {
      throw new Error(`Attempt to switch to invalid mode: ${mode}`);
    }
    this.showContentOverlay(mode);
    Object.values(this.#modeSwitchButtons).forEach(($button) => {
      $button.removeClass('active');
    });
    this.#modeSwitchButtons[mode].addClass('active');
  }

  /**
   * Adds a content overlay to the application.
   *
   * @private
   * @param {string} mode
   *   Mode to which the content overlay belongs.
   * @param {object} contentOverlay
   * @param {JQuery} $container
   */
  addContentOverlay(mode, contentOverlay, $container) {
    this.#contentOverlays[mode] = contentOverlay;
    contentOverlay.$element.hide();
    $container.append(contentOverlay.$element);
  }

  /**
   * Shows the content overlay for a specific mode.
   *
   * @private
   * @param {string} mode
   *   Mode for which to show the content overlay.
   */
  showContentOverlay(mode) {
    if (this.#currentContentOverlay) {
      this.#currentContentOverlay.$element.hide();
    }
    this.#currentContentOverlay = this.#contentOverlays[mode];
    this.#currentContentOverlay.$element.show();
  }

  /**
   * Updates the text elements in the application based on the current language.
   *
   * @private
   */
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

  /**
   * Sets the text of a specific element based on the current language.
   *
   * @param {JQuery} $element
   *   Element to set the text for.
   * @param {string} textKey
   *   Key for the text in the i18n strings.
   */
  setI18nText($element, textKey) {
    const strings = this.config.i18n.strings[this.#lang];
    $element.attr('data-i18n-text', textKey);
    if (strings[textKey]) {
      $element.html(formatText(strings[textKey]));
    } else {
      $element.html(textKey);
    }
  }
}
