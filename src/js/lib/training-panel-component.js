import sleep from '../helpers/sleep';
import {
  createRoundButton,
  createButtonLabelGroup,
  createValueDisplay,
  createValueLabelGroup,
} from '../helpers-web/ui';

export default class TrainingPanelComponent {
  constructor(id, config, nnComponent, trainingController) {
    this.config = config;
    this.nnComponent = nnComponent;
    this.trainingController = trainingController;
    this.transitionDuration = this.config?.app?.ui?.trainingPanelTransitionDuration || 0;
    this.$element = $('<div>')
      .attr('id', id)
      .addClass(['strip-panel', 'training-strip-panel', 'bg-secondary'])
      .css('transition-duration', `${this.transitionDuration}s`);

    this.$stepButton = createRoundButton('step', this.handleStepButton.bind(this));
    this.$runButton = createRoundButton('run', this.handleRunButton.bind(this));
    this.$runButtonIcon = this.$runButton.find('.icon');
    this.$resetButton = createRoundButton('reset', this.handleResetButton.bind(this));
    this.$imageCountValue = createValueDisplay('image-count', '0');
    this.$accuracyValue = createValueDisplay('accuracy', '0%');

    this.initUI();
    this.disableUI();

    this.trainingController.events.on('batch', this.handleTrainingBatch.bind(this));
    this.trainingController.events.on('accuracy', this.handleTrainingAccuracy.bind(this));
    this.trainingController.events.on('start', this.handleTrainingStart.bind(this));
    this.trainingController.events.on('pause', this.handleTrainingPause.bind(this));
    this.trainingController.events.on('training-complete', this.handleTrainingComplete.bind(this));
    this.trainingController.events.on('reset', this.handleTrainingReset.bind(this));
  }

  initUI() {
    $('<div></div>')
      .addClass(['strip-panel-division', 'strip-panel-division-training-ui'])
      .append([
        createButtonLabelGroup('step', 'ui-trainingPanel-step', this.$stepButton),
        createButtonLabelGroup('run', 'ui-trainingPanel-run', this.$runButton),
      ])
      .appendTo(this.$element);

    $('<div></div>')
      .addClass(['strip-panel-division', 'strip-panel-division-values'])
      .append([
        createValueLabelGroup('image-count', 'ui-trainingPanel-imageCount', this.$imageCountValue),
        createValueLabelGroup('accuracy', 'ui-trainingPanel-accuracy', this.$accuracyValue),
      ])
      .appendTo(this.$element);

    $('<div></div>')
      .addClass(['strip-panel-division', 'strip-panel-division-reset'])
      .append(
        createButtonLabelGroup('reset', 'ui-trainingPanel-reset', this.$resetButton)
      )
      .appendTo(this.$element);
  }

  async hide() {
    this.$element.addClass('hidden');
    return sleep(this.transitionDuration * 1000);
  }

  async show() {
    this.$element.removeClass('hidden');
    return sleep(this.transitionDuration * 1000);
  }

  enableUI() {
    this.enableTrainingUI();
    this.$resetButton.attr('disabled', false);
  }

  disableUI() {
    this.disableTrainingUI();
    this.$resetButton.attr('disabled', true);
  }

  enableTrainingUI() {
    this.$runButton.attr('disabled', false);
    this.$stepButton.attr('disabled', false);
  }

  disableTrainingUI() {
    this.$runButton.attr('disabled', true);
    this.$stepButton.attr('disabled', true);
  }

  handleRunButton() {
    if (this.trainingController.isTraining()) {
      this.trainingController.pause();
    } else {
      this.trainingController.start();
    }
  }

  handleStepButton() {
    this.trainingController.step();
  }

  handleResetButton() {
    this.trainingController.reset();
  }

  handleTrainingBatch(imageCount) {
    this.$imageCountValue.text(imageCount);
  }

  handleTrainingAccuracy(accuracy) {
    let accuracyClass;
    if (accuracy > 85) {
      accuracyClass = 'good';
    } else if (accuracy > 50) {
      accuracyClass = 'mediocre';
    } else {
      accuracyClass = 'bad';
    }
    this.$accuracyValue
      .text(`${Math.round(accuracy)}%`)
      .attr('data-ranking', accuracyClass);
  }

  handleTrainingStart() {
    this.$runButton.addClass('running');
    this.$runButton.addClass('active');
    this.$runButtonIcon.removeClass('icon-run').addClass('icon-pause');
    this.nnComponent.disableDrawing();
  }

  handleTrainingPause() {
    this.$element.removeClass('running');
    this.$runButton.removeClass('active');
    this.$runButtonIcon.removeClass('icon-pause').addClass('icon-run');
    this.nnComponent.enableDrawing();
  }

  handleTrainingComplete() {
    this.disableTrainingUI();
  }

  handleTrainingReset() {
    this.enableTrainingUI();
  }
}
