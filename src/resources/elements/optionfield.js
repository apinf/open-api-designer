import {containerless, bindable} from 'aurelia-framework'
import {Field} from './abstract/field'

/**
 * Optionfield is a {@link Field} that gives certain options to the user as
 * checkboxes or a dropdown depending on the format.
 */
@containerless
export class Optionfield extends Field {
  static TYPE = 'option'
  /**
   * The static choices.
   * @type {Array}
   */
  choices = []
  /**
   * Sources where to get dynamic choices from.
   * @type {Array}
   */
  dataSources = []
  /**
   * The type of checkboxes. {@linkplain multi} means multiple checkboxes and
   * output as array with the keys of the selected checkboxes.
   * {@linkplain simple} means a single checkbox and output as boolean that
   * tells whether or not that one checkbox is checked.
   * @type {String}
   */
  checkboxFormat = 'multi'
  /**
   * Whether or not to hide this field if there are no choices.
   * @type {Boolean}
   */
  hideIfNoChoices = true
  /**
   * The choice that is currently selected. Updated with Aurelia binding.
   */
  @bindable
  selectedChoice = ''

  /**
   * @inheritdoc
   * @param {String[]|Object[]} args.choices     The choices to add.
   * @param {Object[]}          args.dataSources Sources from where to get dynamic choices.
   * @param {Boolean}           args.hideIfNoChoices Whether or not to hide this field if there are no choices.
   */
  init(id = '', args = {}) {
    args = Object.assign({
      choices: [],
      dataSources: [],
      format: 'dropdown',
      checkboxFormat: 'multi',
      hideIfNoChoices: true
    }, args)
    this.hideIfNoChoices = args.hideIfNoChoices
    this.argChoices = args.choices
    this.checkboxFormat = args.checkboxFormat
    this.choices = []
    for (const choice of args.choices) {
      if (typeof choice === 'string') {
        // Parse a simple (label-only) choice definition.
        this.choices.push({
          key: choice,
          labelI18nKey: `choices.${choice}`,
          selected: false,
          conditionsFulfilled: true
        })
      } else {
        // Parse a full choice definition.
        const choiceParent = this
        this.choices.push({
          key: choice.key,
          i18nKey: choice.i18nKey,
          labelI18nKey: `choices.${choice.key || choice.i18nKey}`,
          selected: false,
          conditions: choice.conditions,
          // A getter function to check whether all the conditions defined in
          // the schema are fulfilled.
          // The HTML templates can't do this complex logic, so we have to do it
          // here.
          get conditionsFulfilled() {
            return Optionfield.conditionsFulfilled(choice.conditions, choiceParent)
          }
        })
      }
    }
    if (this.choices.length === 0 && this.dataSources.length === 0) {
      // We don't want to leave the choices empty, so if there are no choices,
      // make a checkbox with no label.
      this.choices.push({
        key: this.key,
        i18nKey: '/blank',
        labelI18nKey: '/blank',
        selected: false,
        conditionsFulfilled: true
      })
      this.checkboxFormat = 'simple'
    }
    this.dataSources = args.dataSources
    return super.init(id, args)
  }

  /**
   * Check if this Optionfield is empty. An Optionfield is empty either if the
   * value is false or the value array (checkbox-formatted field) is empty.
   */
  isEmpty() {
    const value = this.getValue()
    return !value || (Array.isArray(value) && value.length === 0)
  }

  /**
   * Called by Aurelia when this field is created.
   * Used for initializing choices and data sources.
   */
  created() {
    for (const choice of this.choices) {
      choice.label = this.localize(choice.labelI18nKey)
    }
    const ds = this.dataSources
    this.dataSources = []
    for (let dataSource of ds) {
      if (typeof dataSource === 'string') {
        dataSource = {
          source: dataSource,
          key: '\${#}'
        }
      }
      const target = this.resolveRef(dataSource.source)
      dataSource.updateFunc = () => {
        dataSource.choices = []
        for (const child of target.iterableChildren) {
          const data = {
            key: child.formatReferencePlusField(dataSource.key),
            selected: false,
            get conditionsFulfilled() {
              return Optionfield.conditionsFulfilled(dataSource.localConditions, target)
                  && Optionfield.conditionsFulfilled(dataSource.targetConditions, target)
            }
          }
          if (dataSource.label) {
            data.label = child.formatReferencePlusField(dataSource.label)
          } else {
            data.label = data.key
          }
          dataSource.choices.push(data)
        }
      }
      target.addChangeListener(dataSource.updateFunc)
      dataSource.updateFunc()
      this.dataSources.push(dataSource)
    }
  }

  shouldDisplay() {
    if (!this.hideIfNoChoices) {
      return super.shouldDisplay()
    }
    for (const choice of this.allChoices) {
      if (choice.conditionsFulfilled) {
        return super.shouldDisplay()
      }
    }
    return false
  }

  static conditionsFulfilled(conditions, parentField) {
    if (conditions) {
      for (const [fieldPath, expectedValue] of Object.entries(conditions)) {
        const field = parentField.resolveRef(fieldPath)
        const value = field ? field.getValue() : undefined
        if (Array.isArray(value) && !value.includes(expectedValue)) {
          return false
        } else if (value !== expectedValue) {
          return false
        }
      }
    }
    return true
  }

  get allChoices() {
    if (this.dataSources.length === 0) {
      return this.choices
    }

    let choices = this.choices
    for (const dataSource of this.dataSources) {
      if (dataSource.choices) {
        choices = choices.concat(dataSource.choices)
      }
    }
    return choices
  }

  /**
   * If this field is a dropdown, get the name of the selected choice.
   * If this field is a simple checkbox, get whether or not the checkbox is checked.
   * If this field is a multi-checkbox field, get the names of the checked checkboxes.
   */
  getValue() {
    if (this.format === 'dropdown') {
      // Optionfield is a dropdown, so there's only one selected field.
      // Return the name of the selected field.
      return this.selectedChoice
    } else if (this.format === 'checkbox') {
      // If this a simple checkbox (only one checkbox), just return whether or
      // not it is selected.
      if (this.checkboxFormat === 'simple') {
        return this.choices[0].selected
      }
      const chosen = []
      // Loop through the choices and add their names to the array that is returned.
      for (const choice of this.choices) {
        if (choice.selected) {
          chosen.push(choice.key)
        }
      }
      return chosen
    }
  }

  /**
   * Get the label(s) of the currently chosen option(s)
   * @return {String|String[]} The label or labels depending on the format of
   *                           this Optionfield.
   */
  getChoiceLabel() {
    if (this.format === 'dropdown') {
      // Optionfield is a dropdown, so there's only one selected field.
      // Loop through the choices to find it and return its label.
      for (const choice of this.choices) {
        if (choice.selected) {
          return choice.label
        }
      }
      return undefined
    } else if (this.format === 'checkbox') {
      // If this a simple checkbox (only one checkbox), just return the label
      // of that.
      if (this.checkboxFormat === 'simple') {
        return this.choices[0].label
      }
      // Loop through the choices and add the labels of the selected choices to
      // the array that is returned.
      const chosen = []
      for (const choice of this.choices) {
        if (choice.selected) {
          chosen.push(choice.label)
        }
      }
      return chosen
    }
  }

  /**
   * Set the chosen fields of this Optionfield and unselect all other fields.
   * @param {String|String[]} value The new choice or choices depending on the
   *                                format of this field.
   */
  setValue(value) {
    this.onSetValue(value)
    if (typeof value === 'boolean' && this.format === 'checkbox' && this.checkboxFormat === 'simple') {
      this.choices[0].selected = value
      return
    } else if (Array.isArray(value) && this.format === 'checkbox') {
      for (const choice of this.choices) {
        if (value.includes(choice.key)) {
          choice.selected = true
        } else if (choice.selected) {
          choice.selected = false
        }
      }
    } else {
      for (const choice of this.choices) {
        if (choice.key === value) {
          choice.selected = true
        } else if (choice.selected) {
          choice.selected = false
        }
      }

      this.selectedChoice = value
    }
  }

  /**
   * Called by Aurelia when it sets the current selection to selectedChoice.
   */
  selectedChoiceChanged() {
    this.setValue(this.selectedChoice)
  }

  /**
   * @return {String} The name of the HTML file that displays the choices in the
   *                  format specified by {@link #format}.
   * @private
   */
  getViewStrategy() {
    return `resources/elements/optionfield-${this.format}.html`
  }
}
