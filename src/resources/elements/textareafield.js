import {containerless} from 'aurelia-framework'
import {Textfield} from './textfield'

/**
 * Textareafield is a {@link Textfield} that has a multi-row text input.
 */
@containerless
export class Textareafield extends Textfield {
  static TYPE = 'textarea'
  /**
   * The number of rows to set to the textarea by default.
   * @type {Number}
   */
  rows = 4

  /**
   * @inheritdoc
   * @param {Number} [args.rows] The number of rows to set to the textarea by
   *                             default.
   */
  init(id = '', args = {}) {
    this.rows = args.rows || 4
    return super.init(id, args)
  }
}
