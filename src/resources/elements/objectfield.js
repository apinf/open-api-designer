import {containerless} from 'aurelia-framework';
import {Parentfield} from './abstract/parentfield';

/**
 * Objectfield is a {@link Parentfield} that has children. The child fields are
 * usually predefined.
 */
@containerless
export class Objectfield extends Parentfield {
  /** @inheritdoc */
  _children = {};
  /**
   * The fields to display in the legend slot of the form.
   */
  legendChildren = undefined;

  /** @inheritdoc */
  init(id = '', args = {}) {
    args = Object.assign({children: {}, collapsed: false, legendChildren: undefined}, args);
    this._children = args.children;
    this.collapsed = args.collapsed;
    this.legendChildren = args.legendChildren;
    return super.init(id, args);
  }

  /**
   * @inheritdoc
   * @return {Object} The values of the children in an object. The keys are the
   *                  IDs of the children.
   */
  getValue() {
    const value = {};
    for (const [key, field] of Object.entries(this.allChildren)) {
      if (!field || !field.showValueInParent || !field.display) {
        continue;
      }
      value[key] = field.getValue();
    }
    return value;
  }

  get allChildren() {
    return Object.assign({}, this.legendChildren, this._children);
  }

  get iterableLegendChildren() {
    return this.legendChildren ? Object.values(this.legendChildren) : [];
  }

  get hasLegend() {
    return this.legendChildren && this.iterableLegendChildren.length > 0;
  }

  /**
   * Set the values of the children of this field.
   *
   * @param {Object} value The values for the children with the ID of the child
   *                       as the object key.
   */
  setValue(value) {
    for (const [key, field] of Object.entries(value)) {
      if (this._children.hasOwnProperty(key)) {
        this._children[key].setValue(field);
      } else if (this.legendChildren && this.legendChildren.hasOwnProperty(key)) {
        this.legendChildren[key].setValue(field);
      }
    }
  }

  /**
   * Add the given child to this object.
   * @param {Field} child The child to add.
   */
  addChild(child) {
    this._children[child.id] = child;
  }

  /** @inheritdoc */
  clone(parent) {
    const clone = new Objectfield();
    const clonedChildren = {};
    for (const [key, field] of Object.entries(this._children)) {
      clonedChildren[key] = field.clone(clone);
      clonedChildren[key].parent = clone;
    }
    const clonedLegendChildren = {};
    if (this.legendChildren) {
      for (const [key, field] of Object.entries(this.legendChildren)) {
        clonedLegendChildren[key] = field.clone(clone);
        clonedLegendChildren[key].parent = clone;
      }
    }
    clone.init(this.id, {
      label: this._label,
      columns: this.columns,
      collapsed: this.collapsed,
      parent: parent || this.parent,
      index: this.index,
      children: clonedChildren,
      legendChildren: clonedLegendChildren
    });
    return clone;
  }

  resolvePath(path) {
    const superResolv = super.resolvePath(path);
    if (superResolv) {
      return superResolv;
    }

    if (this.hasLegend) {
      const elem = this.legendChildren[path[0]];
      if (elem) {
        return elem.resolvePath(path.splice(1));
      }
    }
    return undefined;
  }
}
