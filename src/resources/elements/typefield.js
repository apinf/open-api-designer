import {containerless, bindable} from 'aurelia-framework'
import {Collapsiblefield} from './abstract/collapsiblefield'
import {parseJSON} from '../jsonparser'

/**
 * Typefield is a {@link Field} that shows different child forms depending on
 * the type the user chooses.
 *
 * This allows for theoretically infinite nesting because it uses lazy
 * evaluation and supports $refs in type options.
 */
@containerless
export class Typefield extends Collapsiblefield {
  static TYPE = 'selectable'
  /**
   * The type that is currently selected.
   * @type {String}
   */
  @bindable selectedType = ''
  /**
   * The key where to put the value of the child field to in the output of this
   * field.
   * @type {String}
   */
  valueKey = ''
  /**
   * The key where to put the key of this field ({@link #key}) in the output of
   * this field.
   * @type {String}
   */
  keyKey = ''
  /**
   * The current key of this field. Exists as a legend field in the form if
   * {@link #keyKey} is defined.
   * @type {String}
   */
  @bindable
  key = ''
  /**
   * The UI placeholder for the key form field.
   * @type {String}
   */
  keyPlaceholder = ''
  /**
   * The key where to put the type of this field in the output of this field.
   * The default is {@linkplain x-oad-type} so it won't break the OpenAPI spec.
   * @type {String}
   */
  typeKey = 'x-oad-type'
  /**
   * Whether or not to copy the value over to the new child when switching types.
   *
   * N.B. Absolutely nothing is done to ensure the data ends up in the right
   * place. Only use this if most of the fields in different types are in nearly
   * the same places.
   * @type {Boolean}
   */
  copyValue = false
  /**
   * The current child field.
   * @type {Field}
   * @private
   */
  child = undefined
  /**
   * The schemas for the available types.
   * @type {Object}
   */
  types = {}

  /**
   * @inheritdoc
   * @param {String} [args.valueKey] The key where to put the value of the child
   *                                 field to in the output of this field.
   * @param {String} [args.typeKey]  The key where to put the type of this field
   *                                 in the output of this field.
   * @param {String} [args.keyKey]   The key where to put the key of this field
   *                                 ({@link #key}) in the output of this field.
   * @param {Object} [args.types]    The schemas for the available types.
   * @param {Boolean} [args.copyValue] Whether or not to copy the value over to
   *                                   the new child when switching types.
   * @param {String} [args.keyPlaceholder] The UI placeholder for the key form field.
   * @param {String} [args.selectedType]   The type that should be selected by
   *                                       default.
   */
  init(id = '', args = {}) {
    args = Object.assign({
      valueKey: '',
      // Set default typeKey to something that doesn't break the OpenAPI spec.
      typeKey: 'x-oad-type',
      keyKey: '',
      keyPlaceholder: 'Object key...',
      copyValue: false,
      types: { 'null': { 'type': 'text' } }
    }, args)
    this.types = args.types
    this.valueKey = args.valueKey
    this.typeKey = args.typeKey
    this.keyKey = args.keyKey
    this.keyPlaceholder = args.keyPlaceholder
    this.copyValue = args.copyValue
    this.defaultType = args.defaultType
    this.setType(args.defaultType || Object.keys(this.types)[0])
    return super.init(id, args)
  }

  /**
   * Check if this field doesn't currently have a child or if the child is empty.
   */
  isEmpty() {
    if (this.key.length !== 0) {
      return false
    } else if (!this.child) {
      return true
    }
    return this.child.isEmpty()
  }

  /**
   * Called by Aurelia when the selected type changes (e.g. from the dropdown)
   * @param {String} newType The new type.
   */
  selectedTypeChanged(newType) {
    const newSchema = this.types[newType]
    const value = this.copyValue ? this.getValue() : undefined
    let newChild
    if (newSchema.hasOwnProperty('$ref')) {
      newChild = this.resolveRef(newSchema.$ref).clone()
    } else {
      newChild = parseJSON(newType, JSON.parse(JSON.stringify(newSchema)))
    }
    if (newChild) {
      newChild.parent = this
      if (value) {
        this.setValue(value)
      }
      this.child = newChild
    }
    this.onChange()
  }

  /**
   * Get the value of this field.
   *
   * If the value of the child is undefined, this will return undefined.
   *
   * The value of the child will be put into an object with {@link #valueKey} or
   * `value` as the key if the value is not already an object and one of the
   * following fields is defined:
   *   a) {@link #typeKey}
   *   b) {@link #keyKey}
   *   c) {@link #valueKey}
   * If {@link #valueKey} is defined, the child value will be put into an object
   * as described previously regardless of whether or not the child value is an
   * object.
   *
   * If {@link #typeKey} is defined, the name of the selected type will be added
   * to the return object with {@link #typeKey} as its key.
   * If {@link #keyKey} is defined, the return object will contain a field with
   * {@link #keyKey} as its key and the key from the fieldset legend as the value.
   *
   * @return {Object} The processed value.
   */
  getValue() {
    if (!this.child) {
      return undefined
    }

    let value = this.child.getValue()
    // True if the value of the child is either not an object or is an array.
    // In other words, can/should we put named fields in the value directly?
    const valueIsNotObject = typeof value !== 'object' || Array.isArray(value)
    // If valueKey is set, the value of the child should always be stored in an
    // object with valueKey as the key for the value of the child.
    //
    // If the value is not an object or is an array AND either keyKey or
    // typeKey is set, the above should be done regardless of whether or not
    // valueKey is set.
    if (this.valueKey || (valueIsNotObject && (this.keyKey || this.typeKey))) {
      const valueKey = this.valueKey || 'value'
      value = {
        [valueKey]: value
      }
    }
    if (this.keyKey) {
      value[this.keyKey] = this.key
    }
    if (this.typeKey) {
      value[this.typeKey] = this.selectedType
    }
    return value
  }

  /**
   * Set the value of this field. This reverses anything that{@link #getValue()}
   * does.
   * @param {Object} value The value to set to this field.
   */
  setValue(value) {
    this.onSetValue(value)
    // If the key is available in the given value object, get the key from there
    // and delete the field (from the value object) it was stored in.
    if (this.keyKey && value.hasOwnProperty(this.keyKey)) {
      this.key = value[this.keyKey]
      delete value[this.keyKey]
    }
    // Do the same for the type
    if (this.typeKey && value.hasOwnProperty(this.typeKey)) {
      this.setType(value[this.typeKey])
      delete value[this.typeKey]
    }
    // Try to reverse getValue() in a reliable way.
    // Currently this looks at whether or not valueKey is set and also the type
    // of the object found with valueKey.
    const valueInValueKey = value[this.valueKey || 'value']
    const valueIsNotObject = typeof valueInValueKey === 'object' && !Array.isArray(valueInValueKey)
    if (this.valueKey || ((this.typeKey || this.keyKey) && valueIsNotObject)) {
      this.child.setValue(valueInValueKey)
    } else {
      this.child.setValue(value)
    }
  }

  /**
   * Called by Aurelia when the key of this field changes.
   * Used to trigger {@link #onChange}.
   */
  keyChanged() {
    this.onChange()
  }

  /**
   * Set the selected type.
   */
  setType(type) {
    this.selectedType = type
    this.selectedTypeChanged(type)
  }

  /**
   * Get the currently selected type name.
   */
  getType() {
    return this.selectedType
  }

  /** @inheritdoc */
  resolvePath(path) {
    const parentResolveResult = super.resolvePath(path)
    if (parentResolveResult) {
      return parentResolveResult
    }

    // If the child exists and the next path piece to be resolved targets the
    // child, continue recursing from the child.
    if (this.child && path[0] === ':child') {
      return this.child.resolvePath(path.splice(1))
    }
    return undefined
  }

  /**
   * Get all the possible type names.
   * @return {String[]} The names of the possible types.
   */
  get possibleTypes() {
    return Object.keys(this.types)
  }
}
