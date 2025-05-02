export function createRoundButton(id, clickHandler) {
  return $('<button>')
    .addClass(['button', 'button-round', `button-round-${id}`])
    .on('click', clickHandler)
    .append(
      $('<div></div>')
        .addClass(['icon', `icon-${id}`])
    );
}

export function createLabel(id, textId) {
  return $('<span></span>')
    .addClass(['label', `label-${id}`])
    .attr('data-i18n-text', textId);
}

export function createButtonLabelGroup(id, textId, $button) {
  return $('<div></div>')
    .addClass(['button-label-group', `button-label-group-${id}`])
    .append($button)
    .append(createLabel(id, textId));
}

export function createValueDisplay(id, initialText = '') {
  return $('<span></span>')
    .addClass(['value-display', `value-display-${id}`])
    .text(initialText);
}

export function createValueLabelGroup(id, textId, $valueDisplay) {
  return $('<div></div>')
    .addClass(['value-label-group', `value-label-group-${id}`])
    .append(createLabel(id, textId))
    .append($valueDisplay);
}
