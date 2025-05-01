export default class DefaultContentOverlay {
  constructor() {
    this.$element = $('<div></div>')
      .addClass(['content-overlay', 'content-overlay-default']);

    $('<h1>')
      .attr('data-i18n-text', 'defaultMode-title')
      .appendTo(this.$element);

    $('<p>')
      .attr('data-i18n-text', 'defaultMode-body')
      .addClass('body')
      .appendTo(this.$element);

    $('<div>')
      .attr('id', 'default-mode-input-panel-callout')
      .attr('data-i18n-text', 'defaultMode-inputPanelCallout')
      .addClass('arrow-annotation')
      .appendTo(this.$element);
  }
}
