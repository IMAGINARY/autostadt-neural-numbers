export default class TrainingContentOverlay {
  constructor() {
    this.$element = $('<div></div>')
      .addClass(['content-overlay', 'content-overlay-training']);

    $('<h1>')
      .attr('data-i18n-text', 'trainingMode-title')
      .appendTo(this.$element);

    $('<p>')
      .attr('data-i18n-text', 'trainingMode-body')
      .addClass('body')
      .appendTo(this.$element);
  }
}
