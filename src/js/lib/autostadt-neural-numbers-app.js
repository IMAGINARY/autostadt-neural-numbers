export default class AutostadtNeuralNumbersApp {
  constructor(config) {
    this.config = config;
    this.width = config.app.display.width ?? 1920;
    this.height = config.app.display.height ?? 1080;

    this.$element = $('<div></div>')
      .addClass('autostadt-neural-numbers-app')
      .css({
        width: this.width,
        height: this.height,
      });
  }
}
