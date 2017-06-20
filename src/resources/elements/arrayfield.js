import {containerless} from 'aurelia-framework';
import {Parentfield} from './abstract/parentfield';
import {Field} from './abstract/field';

/**
 * Arrayfield is a {@link Parentfield} that has a variable number of the same kind of child.
 */
@containerless
export class Arrayfield extends Parentfield {
  /**
   * The base object that is cloned whenever a new child is added.
   * @type {Field}
   */
  item;
  /**
   * The field that is used as the key if {@link #format} is {@linkplain map}
   * @type {String}
   */
  keyField = '_key';
  /**
   * The field that is used as the value if {@link #format} is {@linkplain map}
   * This field is optional. By default, the whole value will be used as-is.
   * @type {String}
   */
  valueField = undefined;
  /**
   * Whether or not to add {@linkplain #<index>} to the end of the labels of
   * children.
   * @type {Boolean}
   */
  addIndexToChildLabel = true;
  /**
   * Whether or not to automatically collapse other fields when uncollapsing a
   * field.
   * @type {Boolean}
   */
  collapseManagement = false;
  /** @inheritdoc */
  _children = [];

  /**
   * @inheritdoc
   * @param {Field}   [args.item]       The base object that is cloned to create
   *                                    new children.
   * @param {String}  [args.keyField]   The field that is used as the key if
   *                                    {@link #format} is {@linkplain map}
   * @param {String}  [args.valueField] The field that is used as the value if
   *                                    {@link #format} is {@linkplain map}.
   *                                    This field is optional. By default, the
   *                                    whole value will be used as-is.
   * @param {Boolean} [args.collapsed]  Whether or not the UI element should be
   *                                    collapsed.
   */
  init(id = '', args = {}) {
    args = Object.assign({
      format: 'array',
      keyField: '_key',
      valueField: undefined,
      addIndexToChildLabel: true,
      collapseManagement: false,
      collapsed: false
    }, args);
    this.item = args.item;
    this.keyField = args.keyField;
    this.valueField = args.valueField;
    this.addIndexToChildLabel = args.addIndexToChildLabel;
    this.collapseManagement = args.collapseManagement;
    this.collapsed = args.collapsed;
    return super.init(id, args);
  }

  /**
   * Check if this array is empty. If all children are empty, then this field is
   * also considered to be empty.
   */
  isEmpty() {
    for (const child of this._children) {
      if (!child.isEmpty()) {
        // This field is not empty if any of the children is not empty.
        return false;
      }
    }
    return true;
  }

  /**
   * @inheritdoc
   * @return {Object[]|Object} The values of the children of this array in the
   *                           format specified by {@link #format}.
   */
  getValue() {
    let value = undefined;
    if (this.format === 'map') {
      value = {};
      for (const item of this._children) {
        if (!item.showValueInParent || !item.display) {
          continue;
        } else if (item.isEmpty() && item.hideValueIfEmpty) {
          continue;
        }
        const data = item.getValue();
        const key = data[this.keyField];
        if (this.valueField) {
          value[key] = data[this.valueField];
        } else {
          delete data[this.keyField];
          value[key] = data;
        }
      }
    } else if (this.format === 'array') {
      value = [];
      for (const [index, item] of Object.entries(this._children)) {
        if (!item.showValueInParent || !item.display) {
          continue;
        } else if (item.isEmpty() && item.hideValueIfEmpty) {
          continue;
        }
        value[index] = item.getValue();
      }
    }
    return value;
  }

  childCollapseChanged(field, isNowCollapsed) {
    if (!isNowCollapsed && this.collapseManagement) {
      for (const child of this._children) {
        if (child !== field) {
          child.setCollapsed(true);
        }
      }
    }
  }

  /**
   * @inheritdoc
   * @param {Object|Object[]} value The new value in the format specified by
   *                                {@link #format}.
   */
  setValue(value) {
    this._children = [];
    for (const [key, item] of Object.entries(value)) {
      const index = this.addChild();
      if (this.format === 'map') {
        item[this.keyField] = key;
      }
      this._children[index].setValue(item);
    }
  }

  /**
   * Add a new blank child to this array.
   */
  addChild() {
    if (!(this.item instanceof Field)) {
      return;
    }

    const field = this.item.clone(this);
    field.index = this._children.length;
    field.id = `${this.item.id}-${field.index}`;
    if (this.addIndexToChildLabel) {
      field.labelFormat = `${field.labelFormat} #$index`;
    }
    this._children.push(field);
    if (this.collapseManagement) {
      field.setCollapsed(false);
    }
    this.onChange(field);
    return field.index;
  }

  /**
   * Delete the child with the given index from this field.
   *
   * @override
   * @param  {Number} index The index of the child.
   */
  deleteChild(index) {
    if (this._children.length === 0) {
      return;
    }

    this._children.splice(index, 1);
    for (let i = index; i < this._children.length; i++) {
      const item = this._children[i];
      item.index = i;
    }
    this.onChange();
  }

  /** @inheritdoc */
  clone(parent) {
    const clone = new Arrayfield();
    clone.init(this.id, this);
    if (parent) {
      clone.parent = parent;
    }
    if (this.item instanceof Field) {
      clone.item = this.item.clone();
    }
    return clone;
  }

  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path);
    if (parentResolveResult) {
      return parentResolveResult;
    }

    if (this.format === 'map') {
      // Matches `fieldName(expectedValue)`
      const match = (/([a-zA-Z0-9]+)\((.+?)\)/g).exec(path[0]);
      if (match) {
        const [, fieldName, value] = match;
        for (const child of this._children) {
          if (child.getValue()[fieldName] === value) {
            return child.resolvePath(path.splice(1));
          }
        }
      }
    }

    if (path[0] === ':item') {
      return this.item.resolvePath(path.splice(1));
    }
    return undefined;
  }
}
