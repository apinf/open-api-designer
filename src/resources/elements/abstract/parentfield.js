import {Collapsiblefield} from './collapsiblefield';

/**
 * Parentfield is a {@link Field} with children.
 */
export class Parentfield extends Collapsiblefield {
  /**
   * The internal storage for the children of this field.
   * @private
   */
  _children;
  /**
   * Whether or not to automatically collapse other fields when uncollapsing a
   * field.
   * @type {Boolean}
   */
  collapseManagement = false;

  /**
   * Get the children of this field as an array.
   *
   * @return {Field[]} The children of this field.
   */
  get iterableChildren() {
    return Object.values(this._children);
  }

  /**
   * Get the children of this field, in whatever format they implementation uses.
   */
  get children() {
    return this._children;
  }

  /**
   * Get the child with the given ID.
   * @param  {String|Number} id The ID or index of the child.
   * @return {Field}            The child, or undefined if not found.
   */
  getChild(id) {
    return this._children[id];
  }

  /**
   * Check if this field has a child with the given ID.
   *
   * @param  {String|Number} id The ID or index of the child.
   * @return {Boolean}          Whether or not this field has the child.
   */
  hasChild(id) {
    return this._children.hasOwnProperty(id);
  }

  /**
   * Delete the child with the given ID from this field.
   *
   * @param  {String|Number} id The ID or index of the child.
   */
  deleteChild(id) {
    delete this._children[id];
  }

  /** @inheritdoc */
  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path);
    if (parentResolveResult) {
      return parentResolveResult;
    }

    const elem = this._children[path[0]];
    if (elem) {
      return elem.resolvePath(path.splice(1));
    }
    return undefined;
  }

  /**
   * @inheritdoc
   * @param {Boolean} [args.collapseManagement] Whether or not to automatically
   *                                            collapse other fields when
   *                                            uncollapsing a field.
   */
  init(id = '', args = {}) {
    args = Object.assign({}, {
      collapseManagement: true
    });
    this.collapseManagement = args.collapseManagement;
    return super.init(id, args);
  }

  /**
   * @inheritdoc
   *
   * This handles collapse management.
   */
  childCollapseChanged(field, isNowCollapsed) {
    if (!isNowCollapsed && this.collapseManagement) {
      for (const child of this._children) {
        if (child !== field) {
          child.setCollapsed(true);
        }
      }
    }
  }
}
