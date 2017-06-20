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
  id = '';
  /**
   * The display and/or output format of the field. The field implementation may
   * or may not ignore this.
   * @type {String}
   */
  format = '';
  /**
   * The internal storage for a static label.
   * @type {String}
   * @private
   */
  _label = '';
  /**
   * The text to show in a popup when the user hovers over an info button.
   * @type {String}
   */
  helpText = '';
  formatLabel = false;
  internationalizeLabel = false;
  /**
   * The number of columns this element should use.
   * @type {Number}
   */
  columns = 8;
  /**
   * The conditions on which to display this field.
   * @type {String}
   */
  conditions = {};
  /**
   * The index of this element within the parent. This should only be defined if
   * the parent stores children using numerical indexes. For object-like child
   * storage, the {@link #id} field should be used instead.
   * @type {Number}
   */
  index = undefined;
  /**
   * The parent of this field.
   * @type {Field}
   */
  parent = undefined;
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
  hideValueIfEmpty = false
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
   * Initialize this field with the base data.
   * @param  {String} id                The index of this field.
   * @param  {String} [args.label]      The label of this field.
   * @param  {Number} [args.columns=8]  The number of columns this field should
   *                                    use.
   * @param  {String} [args.format]     The output and/or display format of the
   *                                    field.
   * @param  {String} [args.helpText]   The help text describing this field.
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
   * @return {Field}                    This field.
   */
  init(id, args = {}) {
    args = Object.assign({
      label: id.substr(0, 1).toUpperCase() + id.substr(1),
      columns: 8,
      format: '',
      helpText: '',
      conditions: {},
      showValueInParent: true,
      hideValueIfEmpty: false
    }, args);
    this.id = id;
    this.format = args.format;
    this.helpText = args.helpText;
    this.labelFormat = args.label || args._label;
    this.conditions = args.conditions;
    this.columns = args.columns;
    this.index = args.index;
    this.parent = args.parent;
    this.showValueInParent = args.showValueInParent;
    this.hideValueIfEmpty = args.hideValueIfEmpty;
    return this;
  }

  /**
   * Check if this field is empty. By default, this returns false, but all field
   * implementations should override this.
   */
  isEmpty() {
    return true;
  }
  /**
   * Recursively get an unique identifier for this field.
   */
  get path() {
    if (!this.parent) {
      return this.id;
    }
    return `${this.parent.path}.${this.id}`;
  }

  get display() {
    return this.shouldDisplay();
  }

  shouldDisplay() {
    for (const [path, value] of Object.entries(this.conditions)) {
      const elem = this.resolveRef(path);

      if (!elem) {
        return false;
      }

      const elemValue = elem.getValue();

      if (Array.isArray(value)) {
        if (!value.includes(elemValue)) {
          return false;
        }
      } else if (value !== elemValue) {
        return false;
      }
    }
    return true;
  }

  /**
   * The displayed label for the field. This might be a header (for objects) or
   * just a label (for inputs).
   * @return {String} The label to display.
   */
  get label() {
    let label = this._label;
    if (this.internationalizeLabel) {
      // TODO implement translation here
      label = label;
    }

    if (!this.formatLabel) {
      return label;
    }

    return this.formatReferencePlusField(this.formatIndex(label));
  }

  /**
   * Replace each instance of {@linkplain $index} with the index of this field.
   * @param  {String} string The string to replace the occurences in.
   * @return {String}        The string with all the occurences replaced.
   */
  formatIndex(string) {
    return string.replace(Field.MATCH_INDEX, this.index + 1);
  }

  /**
   * Replace all field references with the values of the references.
   * See {@link #MATCH_REFERENCE_PLUS_FIELD} to see what kind of references are allowed.
   * @param  {String} string The string to replace the occurences in.
   * @return {String}        The string with all the occurences replaced.
   */
  formatReferencePlusField(string) {
    return string.replace(Field.MATCH_REFERENCE_PLUS_FIELD, (match, path, _, field) => {
      const elem = this.resolveRef(path);
      if (elem !== undefined) {
        if (field !== undefined) {
          return elem.getFieldValue(field);
        }
        // Field name not specified, return the value of the form field.
        return elem.getValue();
      }
      // Form field not found.
      return '';
    });
  }

  /**
   * Get the value of the given field or function.
   * @param  {String} name The name of the field. If the field is a function that
   *                       should be called, add {@linkplain ()} to the end.
   * @return {[type]}      [description]
   */
  getFieldValue(name) {
    if (name === undefined) {
      return undefined;
    }

    if (name.endsWith('()')) {
      // Field name specified with braces, so call the field as a function.
      return this[name.substr(0, name.length - 2)]();
    }
    // Field name specified without braces, so just get the value of that field.
    return this[name];
  }

  /**
   * Set the label format.
   */
  set labelFormat(newLabel) {
    if (newLabel === undefined) {
      return;
    }
    if (newLabel.includes('i18n:')) {
      this.internationalizeLabel = true;
      newLabel = newLabel.substr(5);
      // TODO implement translation here
      let translated = newLabel;
      if (translated.includes('$')) {
        this.formatLabel = true;
      }
    } else if (newLabel.includes('$')) {
      this.formatLabel = true;
    }
    this._label = newLabel;
  }

  /**
   * Get the label format.
   */
  get labelFormat() {
    return this._label;
  }

  /**
   * Resolve a path (in JSON reference format) relative to this field.
   *
   * @param  {String} ref The JSON reference to resolve.
   * @return {Field}      The field at the path, or undefined if not found.
   */
  resolveRef(ref) {
    return this.resolvePath(ref.split('/'));
  }

  /**
   * Resolve a path (array) relative to this field.
   *
   * @param  {String[]} path The path to resolve.
   * @return {Field}         The field at the path, or undefined if not found.
   */
  resolvePath(path) {
    if (path.length === 0) {
      return this;
    } else if (path[0] === '.' || path[0] === '#') {
      return this.resolvePath(path.splice(1));
    } else if (path[0] === '..') {
      return this.parent.resolvePath(path.splice(1));
    } else if (path[0].length === 0) {
      return this.superParent().resolvePath(path.splice(1));
    }
    return undefined;
  }

  /**
   * Find the top-level parent of this field.
   *
   * @return {Field} The top-level parent field.
   */
  superParent() {
    if (this.parent) {
      return this.parent.superParent();
    }
    return this;
  }

  /**
   * Delete this field from the parent.
   */
  delete() {
    if (this.parent) {
      this.parent.deleteChild(typeof this.index === 'number' ? this.index : this.id);
    }
  }

  /**
   * Get the value of this field.
   *
   * @return {Object} The value of this field.
   */
  getValue() {
    return undefined;
  }

  /**
   * Set the value of this field.
   *
   * @param {Object} value The new value to set to this field.
   */
  setValue(value) { }

  onChange(field) {
    field = field || this;
    if (this.parent) {
      this.parent.onChange(field);
    }

    for (const listener of this.changeListeners) {
      listener(field);
    }
  }

  addChangeListener(func) {
    this.changeListeners.push(func);
  }

  /**
   * Clone this field.
   *
   * @param {Field} parent The new parent of this field.
   * @return {Field} A deep clone of this field.
   */
  clone(parent) {
    const ExtendedClass = Object.getPrototypeOf(this).constructor;
    const clone = new ExtendedClass();
    clone.init(this.id, this);
    if (parent) {
      clone.parent = parent;
    }
    return clone;
  }
}
