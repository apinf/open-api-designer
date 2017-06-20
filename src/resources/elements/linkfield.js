import {noView} from 'aurelia-framework';
import {Field} from './abstract/field';

/**
 * Linkfield is a field that proxies the value from another field.
 */
@noView
export class Linkfield extends Field {
  /**
   * The target field from which to get the value. If the target refers to this
   * field, the value will be {@linkplain undefined}
   * @type {String}
   */
  target = '#';

  /** @inheritdoc */
  init(id = '', args = {}) {
    this.target = args.target || '#';
    return super.init(id, args);
  }

  /**
   * Check if this link doesn't currently have a resolvable target or if the
   * target is empty.
   */
  isEmpty() {
    const field = this.resolveTarget();
    if (!field) {
      return true;
    }
    return field.isEmpty();
  }

  /**
   * Resolve the path to the target.
   * @return {Field} The target field, or {@linkplain undefined} if the target
   *                 is this field or if {@link Field#resolveRef} returned
   *                 {@linkplain undefined}.
   */
  resolveTarget() {
    const field = this.resolveRef(this.target);
    if (!field || field === this) {
      return undefined;
    }
    return field;
  }

  resolvePath(path) {
    const superResolv = super.resolvePath(path);
    if (superResolv) {
      return superResolv;
    }

    if (path[0] === ':target') {
      const target = this.resolveTarget();
      if (target) {
        return target.resolvePath(path.splice(1));
      }
    }
    return undefined;
  }

  /**
   * Set the value of the target field.
   *
   * @override
   * @param {Object} value The new value to set to the target field.
   */
  setValue(value) {
    const field = this.resolveTarget();
    if (field) {
      field.setValue(value);
    }
  }


  /**
   * Get the value of the target field.
   *
   * @override
   * @return {Object} The value of the target field, or undefined if
   *                  {@link #resolveTarget} returns {@linkplain undefined}.
   */
  getValue() {
    const field = this.resolveTarget();
    return field ? field.getValue() : undefined;
  }
}
