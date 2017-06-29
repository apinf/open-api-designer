import {containerless} from 'aurelia-framework'
import {Parentfield} from './abstract/parentfield'

/**
 * Objectfield is a {@link Parentfield} that has children. The child fields are
 * usually predefined.
 */
@containerless
export class Objectfield extends Parentfield {
  static TYPE = 'object'
  /** @inheritdoc */
  _children = {}
  /**
   * The fields to display in the legend slot of the form.
   */
  legendChildren = undefined
  /**
   * The child that is currently open in the tabbed view.
   * @type {Field}
   */
  activeChild = undefined

  /** @inheritdoc */
  init(id = '', args = {}) {
    args = Object.assign({children: {}, legendChildren: undefined}, args)
    this._children = args.children
    this.legendChildren = args.legendChildren
    return super.init(id, args)
  }

  /**
   * Called by Aurelia when this Objectfield is attached to the DOM.
   * This function is used for activating the first tab by default.
   */
  attached() {
    // Is this a tabbed objectfield that has children?
    if (this.iterableChildren.length > 0 && this.format === 'tabs') {
      // Are there no active tabs?
      if ($(this.tabs).find('.tab-link.open').length === 0) {
        // Then activate the first tab.
        this.switchTab(this.iterableChildren[0])
      }
    }
  }

  /**
   * Check if this object is empty. If all children are empty, then this field
   * is also considered to be empty.
   */
  isEmpty() {
    for (const child of Object.values(this.allChildren)) {
      if (!child.isEmpty()) {
        return false
      }
    }
    return true
  }

  /**
   * @inheritdoc
   * @return {Object} The values of the children in an object. The keys are the
   *                  IDs of the children.
   */
  getValue() {
    const value = {}
    for (const [key, field] of Object.entries(this.allChildren)) {
      if (!field || !field.showValueInParent || !field.display) {
        continue
      } else if (field.isEmpty() && field.hideValueIfEmpty) {
        continue
      }
      value[key] = field.getValue()
    }
    return value
  }

  /** @inheritdoc */
  get allChildren() {
    return Object.assign({}, this.legendChildren, this._children)
  }

  /** @inheritdoc */
  get iterableLegendChildren() {
    return this.legendChildren ? Object.values(this.legendChildren) : []
  }

  /** @inheritdoc */
  get hasLegend() {
    return this.legendChildren && this.iterableLegendChildren.length > 0
  }

  /**
   * Set the values of the children of this field.
   *
   * @param {Object} value The values for the children with the ID of the child
   *                       as the object key.
   */
  setValue(value) {
    this.onSetValue(value)
    for (const [key, field] of Object.entries(value)) {
      if (this._children.hasOwnProperty(key)) {
        this._children[key].setValue(field)
      } else if (this.legendChildren && this.legendChildren.hasOwnProperty(key)) {
        this.legendChildren[key].setValue(field)
      }
    }
  }

  /**
   * Add the given child to this object.
   * @param {Field} child The child to add.
   */
  addChild(child) {
    this._children[child.id] = child
    this.onChange(child)
  }

  /**
   * Switch to the tab of the given child element.
   * @param  {Field} toChild The child whose tab to switch to.
   */
  switchTab(toChild) {
    this.activeChild = toChild
    const tabElem = $(`#tab-${toChild.path.replace(/\./g, '\\.')}`)
    tabElem.parent().find('.tab-link.open').removeClass('open')
    tabElem.addClass('open')
  }

  /** @inheritdoc */
  clone(parent) {
    const clone = new Objectfield()
    const clonedChildren = {}
    for (const [key, field] of Object.entries(this._children)) {
      clonedChildren[key] = field.clone(clone)
      clonedChildren[key].parent = clone
    }
    const clonedLegendChildren = {}
    if (this.legendChildren) {
      for (const [key, field] of Object.entries(this.legendChildren)) {
        clonedLegendChildren[key] = field.clone(clone)
        clonedLegendChildren[key].parent = clone
      }
    }
    clone.init(this.id, {
      format: this.format,
      columns: this.columns,
      collapsed: this.collapsed,
      parent: parent || this.parent,
      index: this.index,
      hideValueIfEmpty: this.hideValueIfEmpty,
      setValueListeners: this.setValueListeners,
      i18n: this.i18n,
      children: clonedChildren,
      legendChildren: clonedLegendChildren
    })
    return clone
  }

  /** @inheritdoc */
  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path)
    if (parentResolveResult) {
      return parentResolveResult
    }

    if (this.hasLegend) {
      const elem = this.legendChildren[path[0]]
      if (elem) {
        return elem.resolvePath(path.splice(1))
      }
    }
    return undefined
  }

  /**
   * @return {String} The name of the HTML file that displays the object with
   *                  the format specified in {@link #format}.
   * @private
   */
  getViewStrategy() {
    if (this.format === 'tabs') {
      return 'resources/elements/objectfield-tabbed.html'
    }
    return 'resources/elements/objectfield.html'
  }
}
