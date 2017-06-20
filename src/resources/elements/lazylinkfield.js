import {containerless} from 'aurelia-framework';
import {Field} from './abstract/field';

/**
 * LazyLinkfield is a field that lazily proxies the a whole field (value & UI)
 * to another place.
 */
@containerless
export class LazyLinkfield extends Field {
  target = '#';
  overrides = {};
  child = undefined;

  /** @inheritdoc */
  init(id = '', args = {}) {
    this.target = args.target || '#';
    this.overrides = args.overrides || {};
    return super.init(id, args);
  }

  /**
   * Check if this link doesn't currently have a child or if the child is empty.
   */
  isEmpty() {
    if (!this.child) {
      return true;
    }
    return this.child.isEmpty();
  }

  /**
   * Create the child of this field. Basically copy the target, set the parent
   * and apply field overrides.
   * This doesn't return anything, since it just sets the {@link #child} field.
   */
  createChild() {
    this.child = this.resolveRef(this.target).clone(this);
    for (const [field, value] of Object.entries(this.overrides)) {
      let target;
      let fieldPath;
      if (field.includes(';')) {
        let elementPath;
        [elementPath, fieldPath] = field.split(';');
        fieldPath = fieldPath.split('/');
        target = this.child.resolveRef(elementPath);
      } else {
        fieldPath = field.split('/');
        target = this.child;
      }
      const lastFieldPathEntry = fieldPath.splice(-1)[0];
      target = this.resolveRawPath(target, fieldPath);
      if (value === null) {
        delete target[lastFieldPathEntry];
      } else {
        target[lastFieldPathEntry] = value;
      }
    }
  }

  /**
   * Recurse through an object to find a specific nested field.
   */
  resolveRawPath(object, path) {
    if (path.length === 0) {
      return object;
    } else if (path[0] === '#') {
      return this.resolveRawPath(object, path.splice(1));
    }
    return this.resolveRawPath(object[path[0]], path.splice(1));
  }

  /**
   * Delete the current child.
   */
  deleteChild() {
    this.child = undefined;
  }

  /** @inheritdoc */
  shouldDisplay() {
    // This function is called by Aurelia (due to the if.bind="display" in HTML)
    // and so changes to the output of the parent shouldDisplay can be detected
    // here.
    // When this field appears, the child will be generated. When the field dis-
    // appears, the child will be deleted. This is what makes this link field
    // lazy.
    const display = super.shouldDisplay();
    if (display) {
      if (this.child === undefined) {
        this.createChild();
      }
    } else if (this.child !== undefined) {
      this.deleteChild();
    }
    return display;
  }

  /**
   * Set the value of the target field.
   *
   * @override
   * @param {Object} value The new value to set to the target field.
   */
  setValue(value) {
    if (!this.child) {
      return;
    }
    this.child.setValue(value);
  }


  /**
   * Get the value of the target field.
   *
   * @override
   * @return {Object} The value of the target field, or undefined if
   *                  {@link #resolveTarget} returns {@linkplain undefined}.
   */
  getValue() {
    return this.child ? this.child.getValue() : undefined;
  }

  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path);
    if (parentResolveResult) {
      return parentResolveResult;
    }

    // If the child exists and the next path piece to be resolved targets the
    // child, continue recursing from the child.
    if (this.child && path[0] === ':child') {
      return this.child.resolvePath(path.splice(1));
    }
    return undefined;
  }
}
