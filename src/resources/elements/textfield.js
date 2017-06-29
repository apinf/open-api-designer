import {observable, containerless} from 'aurelia-framework'
import {Field} from './abstract/field'

/**
 * Textfield is a {@link Field} with a basic single-line text input.
 */
@containerless
export class Textfield extends Field {
  static TYPE = 'text'
  /**
   * The text value of the input field.
   * @type {String}
   */
  @observable
  value = ''
  /**
   * Autocompletions that the text input should offer.
   * @type {String[]}
   */
  autocomplete = undefined

  /**
   * @inheritdoc
   * @param {String} [args.value]        The value of the input field.
   * @param {String} [args.placeholder]  The input placeholder text.
   * @param {String} [args.autocomplete] Autocompletions that the text input
   *                                     should offer.
   */
  init(id = '', args = {}) {
    args = Object.assign({
      value: '',
      autocomplete: undefined,
      format: 'text'
    }, args)
    this.value = args.value
    this.autocomplete = args.autocomplete
    return super.init(id, args)
  }

  /**
   * Get the ID for the autocomplete list DOM element.
   */
  get listID() {
    return `autocomplete-${this.id}`
  }

  /**
   * Get the placeholder for this field. Defaults to {@linkplain Enter value...}
   * @return {String} The localized placeholder for this field.
   */
  get placeholder() {
    return this.localize('placeholder', 'Enter value...')
  }

  /**
   * Check if the text input field is empty.
   */
  isEmpty() {
    return this.value.length === 0
  }

  /**
   * @inheritdoc
   * @return {String} The text in the input field.
   */
  getValue() {
    return this.value
  }

  /**
   * @inheritdoc
   * @param {String} value The new text to set to the input field.
   */
  setValue(value) {
    this.onSetValue(value)
    this.value = value
  }

  /**
   * Called by Aurelia when the value string changes.
   * Used to trigger {@link #onChange}.
   */
  valueChanged() {
    this.onChange()
  }
}
