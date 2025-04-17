export default class AutostadtNeuralNumbersApp {
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

    this.renderTexts($frame);
    this.renderNav($frame);
  }

  // eslint-disable-next-line class-methods-use-this
  renderTexts($container) {
    const formatText = (t) => t.replace(/\n/g, '<br>');
    const headingText = 'Erkennt\ndie KI deine\nZahl?';
    const bodyText = 'Statt nur eine einzige Antwort zu geben, prüft die KI mehrere Möglichkeiten und bewertet, wie wahrscheinlich jede davon ist. Je klarer die Merkmale, desto sicherer ist sie – doch bei unscharfen oder uneindeutigen Eingaben kann sie ins Grübeln kommen oder falsch liegen.';

    $('<h1>')
      .attr('i18n-text', 'heading')
      .html(formatText(headingText))
      .appendTo($container);

    $('<p>')
      .attr('i18n-text', 'body')
      .html(formatText(bodyText))
      .appendTo($container);
  }

  renderNav($container) {
    $('<button />')
      .attr('i18n-text', 'switch-language')
      .addClass('button')
      .text('English')
      .on('click', () => {
        this.toggleLanguage();
      })
      .appendTo($container);
  }
}
