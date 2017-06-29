/**
 * Field is the base for actual field type elements.
 */
export class Field {
  /**
   * Match a form field reference optionally followed by a JS field or function.
   *
   * Examples:
   *   {@linkplain #/reference/to/form/field:jsFieldName}
   *   {@linkplain #/another/reference:jsFunctionName()}
   *   {@linkplain #/third/reference/without/js/field}
  */
  static MATCH_REFERENCE_PLUS_FIELD = /\${(.+?)(\:([a-zA-Z0-9]+(\(\))?))?}/g
  /**
   * Match the string {@linkplain $index}
   * @type {String}
   */
  static MATCH_INDEX = /\$index/g
  /**
   * The ID of the field. Not displayed to the user directly.
   * @type {String}
   */
  id = ''
  /**
   * The display and/or output format of the field. The field implementation may
   * or may not ignore this.
   * @type {String}
   */
  format = ''
  /**
   * The number of columns this element should use.
   * @type {Number}
   */
  columns = 8
  /**
   * The conditions on which to display this field.
   * @type {String}
   */
  conditions = {}
  /**
   * The index of this element within the parent. This should only be defined if
   * the parent stores children using numerical indexes. For object-like child
   * storage, the {@link #id} field should be used instead.
   * @type {Number}
   */
  index = undefined
  /**
   * The parent of this field.
   * @type {Field}
   */
  parent = undefined
  /**
   * Whether or not the parent should include the value of this field in its
   * value. Useful to set to false when using {@link Linkfield}s
   * @type {Boolean}
   */
  showValueInParent = true
  /**
   * Whether or not the value of this field should be hidden from the output
   * when it's empty.
   * @type {Boolean}
   */
  hideValueIfEmpty = true
  /**
   * Whether or not this field has the field {@link #collapsed} and the method
   * {@link #toggleCollapse()}
   *
   * @type {Boolean}
   */
  isCollapsible = false
  /**
   * Functions that will be called when this field changes.
   * @type {Function[]}
   */
  changeListeners = []
  /**
   * Functions that will be called when {@link #setValue} is called.
   * @type {Function[]}
   */
  setValueListeners = []
  /**
   * I18n settings
   * @type {Object}
   */
  i18n = {}
  /**
   * Object that contains cached localizations for this field for the current
   * language. Use {@link #localize()} instead of directly accessing this object.
   * This object is cleared when the locale changes so that the localizations
   * would be updated.
   * @type {Object}
   */
  localizations = {}

  /**
   * Get the path to this field for i18n purposes.
   */
  get i18nPath() {
    if (this.i18n.path) {
      return this.i18n.path
    } else if (!this.i18n.cachedPath) {
      if (!this.parent) {
        this.i18n.cachedPath = this.id
      } else if (this.parent.type === 'array') {
        this.i18n.cachedPath = `${this.parent.i18nPath}.item`
      } else {
        this.i18n.cachedPath = `${this.parent.i18nPath}.${this.id}`
      }
    }
    return this.i18n.cachedPath
  }

  /**
   * Localize a string under this field. The {@link #i18nPath} of this field is
   * prepended to the {@linkplain fieldName} parameter.
   * @param  {String} fieldName    The name of the i18n field.
   * @param  {String} defaultValue The value to use if a translation is not found.
   *                               If not specified, the default value will be
   *                               the whole i18n path ({@link #i18nPath} + {@linkplain fieldName})
   * @return {String}              The localized string.
   */
  localize(fieldName, defaultValue) {
    if (!fieldName) {
      fieldName = 'label'
    }
    if (!this.localizations.hasOwnProperty(fieldName)) {
      let path
      if (fieldName.includes('/')) {
        path = fieldName.substr(fieldName.indexOf('/') + 1)
      } else if (this.i18n.keys.hasOwnProperty(fieldName)) {
        path = this.i18n.keys[fieldName]
      } else {
        path = `${this.i18nPath}.${fieldName}`
      }
      let translation = Field.internationalizer.tr(path, this.i18n.interpolations)
      if (!translation || (typeof defaultValue === 'string' && translation === path)) {
        translation = defaultValue
      }
      this.localizations[fieldName] = translation
      return translation
    }
    return this.localizations[fieldName]
  }

  /**
   * Initialize this field with the base data.
   * @param  {String} id                The index of this field.
   * @param  {Number} [args.columns=8]  The number of columns this field should
   *                                    use.
   * @param  {String} [args.format]     The output and/or display format of the
   *                                    field.
   * @param  {Field}  [args.parent]     The parent of this field.
   * @param  {Number} [args.index]      The numerical index of this field within
   *                                    the parent.
   * @param  {Object} [args.conditions] The display conditions of this field.
   * @param  {Boolean} [args.showValueInParent] Whether or not the parent should
   *                                            include the value of this field
   *                                            in its value.
   * @param  {Boolean} [args.hideValueIfEmpty]  Whether or not the value of this
   *                                            field should be hidden from the
   *                                            output when its empty.
   * @param {String} [args.i18n.path]           The path to use for I18n instead
   *                                            of the path within the form.
   * @param {Object} [args.i18n.keys]           Key:value pairs that define local
   *                                            I18n keys that should be replaced
   *                                            by another I18n path.
   * @param {Object} [args.i18n.interpolations] I18n interpolations.
   * @return {Field}                    This field.
   */
  init(id, args = {}) {
    args = Object.assign({
      columns: 8,
      format: '',
      conditions: {},
      showValueInParent: true,
      hideValueIfEmpty: true,
      setValueListeners: [],
      i18n: {}
    }, args)
    args.i18n = Object.assign({
      path: '',
      keys: {},
      interpolations: {}
    }, args.i18n)
    Field.eventAggregator.subscribe('i18n:locale:changed', () => this.localizations = {})
    this.id = id
    this.format = args.format
    this.conditions = args.conditions
    this.columns = args.columns
    this.index = args.index
    this.parent = args.parent
    this.showValueInParent = args.showValueInParent
    this.hideValueIfEmpty = args.hideValueIfEmpty
    this.setValueListeners = args.setValueListeners
    this.i18n = args.i18n
    this.i18n.interpolations.index = '$index'
    this.type = this.constructor.TYPE
    return this
  }

  /**
   * Check if this field is empty. By default, this returns false, but all field
   * implementations should override this.
   */
  isEmpty() {
    return true
  }
  /**
   * Recursively get an unique identifier for this field.
   */
  get path() {
    if (!this.parent) {
      return this.id
    }
    return `${this.parent.path}.${this.id}`
  }

  /**
   * Getter for {@link shouldDisplay}
   */
  get display() {
    return this.shouldDisplay()
  }

  /**
   * Check whether or not this field should be displayed.
   */
  shouldDisplay() {
    for (const [path, value] of Object.entries(this.conditions)) {
      const elem = this.resolveRef(path)

      if (!elem) {
        return false
      }

      const elemValue = elem.getValue()

      if (Array.isArray(value)) {
        if (!value.includes(elemValue)) {
          return false
        }
      } else if (value !== elemValue) {
        return false
      }
    }
    return true
  }

  /**
   * The displayed label for the field. This might be a header (for objects) or
   * just a label (for inputs).
   * @return {String} The label to display.
   */
  get label() {
    let label = this.localize('label')
    if (!label) {
      return ''
    } else if (!label.includes('$')) {
      return label
    }

    return this.formatReferencePlusField(this.formatIndex(label))
  }

  /**
   * Get the help text for this field.
   */
  get helpText() {
    return this.localize('helpText', '')
  }

  /**
   * Replace each instance of {@linkplain $index} with the index of this field.
   * @param  {String} string The string to replace the occurences in.
   * @return {String}        The string with all the occurences replaced.
   */
  formatIndex(string) {
    return string.replace(Field.MATCH_INDEX, this.index + 1)
  }

  /**
   * Replace all field references with the values of the references.
   * See {@link #MATCH_REFERENCE_PLUS_FIELD} to see what kind of references are allowed.
   * @param  {String} string The string to replace the occurences in.
   * @return {String}        The string with all the occurences replaced.
   */
  formatReferencePlusField(string) {
    return string.replace(Field.MATCH_REFERENCE_PLUS_FIELD, (match, path, _, field) => {
      const elem = this.resolveRef(path)
      if (elem !== undefined) {
        if (field !== undefined) {
          return elem.getFieldValue(field)
        }
        // Field name not specified, return the value of the form field.
        return elem.getValue()
      }
      // Form field not found.
      return ''
    })
  }

  /**
   * Get the value of the given field or function.
   * @param  {String} name The name of the field. If the field is a function that
   *                       should be called, add {@linkplain ()} to the end.
   * @return {[type]}      [description]
   */
  getFieldValue(name) {
    if (name === undefined) {
      return undefined
    }

    if (name.endsWith('()')) {
      // Field name specified with braces, so call the field as a function.
      return this[name.substr(0, name.length - 2)]()
    }
    // Field name specified without braces, so just get the value of that field.
    return this[name]
  }

  /**
   * Resolve a path (in JSON reference format) relative to this field.
   *
   * @param  {String} ref The JSON reference to resolve.
   * @return {Field}      The field at the path, or undefined if not found.
   */
  resolveRef(ref) {
    return this.resolvePath(ref.split('/'))
  }

  /**
   * Resolve a path (array) relative to this field.
   *
   * @param  {String[]} path The path to resolve.
   * @return {Field}         The field at the path, or undefined if not found.
   */
  resolvePath(path) {
    if (path.length === 0) {
      return this
    } else if (path[0] === '.' || path[0] === '#') {
      return this.resolvePath(path.splice(1))
    } else if (path[0] === '..') {
      return this.parent.resolvePath(path.splice(1))
    } else if (path[0].length === 0) {
      return this.superParent().resolvePath(path.splice(1))
    }
    return undefined
  }

  /**
   * Find the top-level parent of this field.
   *
   * @return {Field} The top-level parent field.
   */
  superParent() {
    if (this.parent) {
      return this.parent.superParent()
    }
    return this
  }

  /**
   * Delete this field from the parent.
   */
  delete() {
    if (this.parent) {
      this.parent.deleteChild(typeof this.index === 'number' ? this.index : this.id)
    }
  }

  /**
   * Get the value of this field.
   *
   * @return {Object} The value of this field.
   */
  getValue() {
    return undefined
  }

  /**
   * Set the value of this field.
   *
   * @param {Object} value The new value to set to this field.
   */
  setValue(value) { }

  /**
   * Called automatically when this field or its children change.
   * @param  {Field} field The field that changed.
   */
  onChange(field) {
    field = field || this
    if (this.parent) {
      this.parent.onChange(field)
    }

    for (const listener of this.changeListeners) {
      listener(field)
    }
  }

  /**
   * Add a function that is called whenever this field or any of its children
   * change.
   * @param {Function} func The callback function.
   */
  addChangeListener(func) {
    this.changeListeners.push(func)
  }

  /**
   * Called with {@link #setValue} to run listeners.
   */
  onSetValue(newValue) {
    for (const listener of this.setValueListeners) {
      if (typeof listener === 'function') {
        listener(this, newValue)
      }
    }
  }

  /**
   * Add a function to be called when {@link #setValue} is called.
   * @param {Function} func The callback function.
   */
  addSetValueListener(func) {
    this.setValueListeners.push(func)
  }

  /**
   * Clone this field.
   *
   * @param {Field} parent The new parent of this field.
   * @return {Field} A deep clone of this field.
   */
  clone(parent) {
    const ExtendedClass = Object.getPrototypeOf(this).constructor
    const clone = new ExtendedClass()
    clone.init(this.id, this)
    if (parent) {
      clone.parent = parent
    }
    return clone
  }

  // Functions implemented in Collapsiblefield.
  setCollapsed() {}
  toggleCollapse() {}
  childCollapseChanged() {}
}
