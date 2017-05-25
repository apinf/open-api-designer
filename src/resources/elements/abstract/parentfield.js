import {Field} from './field';

/**
 * Parentfield is a {@link Field} with children.
 */
export class Parentfield extends Field {
  /**
   * The internal storage for the children of this field.
   * @private
   */
  _children;
  /**
   * Whether or not the UI element should be collapsed (i.e. only show the title)
   * @type {Boolean}
   */
  collapsed = false;
  isCollapsible = true;

  childCollapseChanged(field, isNowCollapsed) {}

  toggleCollapse() {
    this.setCollapsed(!this.collapsed);
  }

  setCollapsed(collapsed) {
    this.collapsed = collapsed;
    if (this.parent) {
      this.parent.childCollapseChanged(this, this.collapsed);
    }
  }

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
    const superResolv = super.resolvePath(path);
    if (superResolv) {
      return superResolv;
    }

    const elem = this._children[path[0]];
    if (elem) {
      return elem.resolvePath(path.splice(1));
    }
    return undefined;
  }
}
