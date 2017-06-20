import {containerless, bindable} from 'aurelia-framework';
import {Field} from './abstract/field';
import {parseJSON} from '../jsonparser';

/**
 * Typefield is a {@link Field} that shows different child forms depending on
 * the type the user chooses.
 *
 * This allows for theoretically infinite nesting because it uses lazy
 * evaluation and supports $refs in type options.
 */
@containerless
export class Typefield extends Field {
  /**
   * The type that is currently selected.
   * @type {String}
   */
  @bindable selectedType = '';
  /**
   * The key where to put the value of the child field to in the output of this
   * field.
   * @type {String}
   */
  valueKey = '';
  /**
   * The key where to put the key of this field ({@link #key}) in the output of
   * this field.
   * @type {String}
   */
  keyKey = '';
  /**
   * The current key of this field. Exists as a legend field in the form if
   * {@link #keyKey} is defined.
   * @type {String}
   */
  key = '';
  /**
   * The placeholder for the key form field.
   * @type {String}
   */
  keyPlaceholder = '';
  /**
   * Whether or not to show the chosen type in the value of this field.
   * @type {Boolean}
   */
  showType = true;
  /**
   * Whether or not to copy the value over to the new child when switching types.
   *
   * N.B. Absolutely nothing is done to ensure the data ends up in the right
   * place. Only use this if most of the fields in different types are in nearly
   * the same places.
   * @type {Boolean}
   */
  copyValue = false;
  /**
   * The current child field.
   * @type {Field}
   * @private
   */
  child = undefined;
  /**
   * The schemas for the available types.
   * @type {Object}
   */
  types = {};
  /**
   * Whether or not the UI element should be collapsed (i.e. only show the title)
   * @type {Boolean}
   */
  collapsed = false;
  isCollapsible = true;

  /*
   * Called by child fields when they are collapsed/uncollapsed.
   * Unused in Typefields, currently only used in Arrayfields.
   */
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

  /** @inheritdoc */
  init(id = '', args = {}) {
    args = Object.assign({
      valueKey: '',
      keyKey: '',
      keyPlaceholder: 'Object key...',
      showType: true,
      copyValue: false,
      collapsed: false,
      types: { 'null': { 'type': 'text' } }
    }, args);
    this.types = args.types;
    this.valueKey = args.valueKey;
    this.keyKey = args.keyKey;
    this.keyPlaceholder = args.keyPlaceholder;
    this.showType = args.showType;
    this.copyValue = args.copyValue;
    this.collapsed = args.collapsed;
    this.defaultType = args.defaultType;
    this.selectedType = args.defaultType || Object.keys(this.types)[0];
    this.selectedTypeChanged(this.selectedType);
    return super.init(id, args);
  }

  /**
   * Check if this field doesn't currently have a child or if the child is empty.
   */
  isEmpty() {
    if (!this.child) {
      return true;
    }
    return this.child.isEmpty();
  }

  /**
   * Called by Aurelia when the selected type changes (e.g. from the dropdown)
   * @param {String} newType The new type.
   */
  selectedTypeChanged(newType) {
    const newSchema = this.types[newType];
    const value = this.copyValue ? this.getValue() : undefined;
    let newChild;
    if (newSchema.hasOwnProperty('$ref')) {
      newChild = this.resolveRef(newSchema.$ref).clone();
    } else {
      newChild = parseJSON(newType, JSON.parse(JSON.stringify(newSchema)));
    }
    if (newChild) {
      newChild.parent = this;
      if (value) {
        this.setValue(value);
      }
      this.child = newChild;
    }
    this.onChange();
  }

  /**
   * Get the value of this field.
   *
   * If the value of the child is undefined, this will return undefined.
   *
   * The value of the child will be put into an object with {@link #valueKey} or
   * `value` as the key if the value is not already an object and one of the
   * following is true:
   *   a) {@link #showType} is {@linkplain true}
   *   b) {@link #keyKey} is defined
   *   c) {@link #valueKey} is defined
   * If {@link #valueKey} is defined, the child value will be put into an object
   * as described previously regardless of whether or not the child value is an
   * object.
   *
   * If {@link #showType} is {@linkplain true}, the name of the selected type
   * will be added to the return object.
   * If {@link #keyKey} is defined, the return object will contain a field with
   * {@link #keyKey} as its key and the key from the fieldset legend as the value.
   *
   * @return {Object} The processed value.
   */
  getValue() {
    if (!this.child) {
      return undefined;
    }

    let value = this.child.getValue();
    // True if the value of the child is either not an object or is an array.
    // In other words, can/should we put named fields in the value directly?
    const valueIsNotObject = typeof value !== 'object' || Array.isArray(value);
    // If valueKey is set, the value of the child should always be stored in an
    // object with valueKey as the key for the value of the child.
    //
    // If the value is not an object or is an array AND either keyKey or
    // showType is set, the above should be done regardless of whether or not
    // valueKey is set.
    if (this.valueKey || (valueIsNotObject && (this.keyKey || this.showType))) {
      const valueKey = this.valueKey || 'value';
      value = {
        [valueKey]: value
      };
    }
    if (this.keyKey) {
      value[this.keyKey] = this.key;
    }
    if (this.showType) {
      value.type = this.selectedType;
    }
    return value;
  }

  setValue(value) {
    if (this.keyKey && value.hasOwnProperty(this.keyKey)) {
      this.key = value[this.keyKey];
    }
    if (!this.showType) {
      this.child.setValue(value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      delete value.type;
      this.child.setValue(value);
    } else {
      this.child.setValue(value[this.valueKey || 'value']);
    }
  }

  setType(type) {
    this.selectedType = type;
  }

  getType() {
    return this.selectedType;
  }

  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path);
    if (parentResolveResult) {
      return parentResolveResult;
    }

    if (this.child && path[0] === ':child') {
      return this.child.resolvePath(path.splice(1));
    }
    return undefined;
  }

  /**
   * Get all the possible type names.
   * @return {String[]} The names of the possible types.
   */
  get possibleTypes() {
    return Object.keys(this.types);
  }
}
