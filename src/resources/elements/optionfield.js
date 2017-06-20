import {containerless, bindable} from 'aurelia-framework';
import {Field} from './abstract/field';

/**
 * Optionfield is a {@link Field} that gives certain options to the user as
 * checkboxes or a dropdown depending on the format.
 */
@containerless
export class Optionfield extends Field {
  /**
   * The static choices.
   * @type {Array}
   */
  choices = [];
  /**
   * Sources where to get dynamic choices from.
   * @type {Array}
   */
  dataSources = [];
  /**
   * Whether or not to hide this field if there are no choices.
   * @type {Boolean}
   */
  hideIfNoChoices = true;
  /**
   * The choice that is currently selected. Updated with Aurelia binding.
   */
  @bindable
  selectedChoice = '';

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
      hideIfNoChoices: true
    }, args);
    this.hideIfNoChoices = args.hideIfNoChoices;
    this.argChoices = args.choices;

    this.choices = [];
    for (const choice of args.choices) {
      if (typeof choice === 'string') {
        // Parse a simple (label-only) choice definition.
        this.choices.push({
          key: choice,
          label: choice,
          selected: false,
          conditionsFulfilled: true
        });
      } else {
        // Parse a full choice definition.
        const choiceParent = this;
        this.choices.push({
          key: choice.key,
          label: choice.label || choice.key,
          selected: false,
          conditions: choice.conditions,
          // A getter function to check whether all the conditions defined in
          // the schema are fulfilled.
          // The HTML templates can't do this complex logic, so we have to do it
          // here.
          get conditionsFulfilled() {
            return Optionfield.conditionsFulfilled(choice.conditions, choiceParent);
          }
        });
      }
    }

    this.dataSources = args.dataSources;

    if (this.choices.length === 0 && this.dataSources.length === 0) {
      // We don't want to leave the choices empty, so if there are no choices,
      // make a checkbox with no label.
      this.choices.push({
        key: this.key,
        label: '',
        selected: false,
        conditionsFulfilled: true
      });
      this.checkboxFormat = 'simple';
    }
    return super.init(id, args);
  }

  isEmpty() {
    const value = this.getValue();
    return !value || (Array.isArray(value) && value.length === 0);
  }

  created() {
    const ds = this.dataSources;
    this.dataSources = [];
    for (let dataSource of ds) {
      if (typeof dataSource === 'string') {
        dataSource = {
          source: dataSource,
          key: '\${#}'
        };
      }
      const target = this.resolveRef(dataSource.source);
      dataSource.updateFunc = () => {
        dataSource.choices = [];
        for (const child of target.iterableChildren) {
          const data = {
            key: child.formatReferencePlusField(dataSource.key),
            selected: false,
            get conditionsFulfilled() {
              return Optionfield.conditionsFulfilled(dataSource.localConditions, target)
                  && Optionfield.conditionsFulfilled(dataSource.targetConditions, target);
            }
          };
          if (dataSource.label) {
            data.label = child.formatReferencePlusField(dataSource.label);
          } else {
            data.label = data.key;
          }
          dataSource.choices.push(data);
        }
      };
      target.addChangeListener(dataSource.updateFunc);
      dataSource.updateFunc();
      this.dataSources.push(dataSource);
    }
  }

  shouldDisplay() {
    if (!this.hideIfNoChoices) {
      return super.shouldDisplay();
    }
    for (const choice of this.allChoices) {
      if (choice.conditionsFulfilled) {
        return super.shouldDisplay();
      }
    }
    return false;
  }

  static conditionsFulfilled(conditions, parentField) {
    if (conditions) {
      for (const [fieldPath, expectedValue] of Object.entries(conditions)) {
        const field = parentField.resolveRef(fieldPath);
        const value = field ? field.getValue() : undefined;
        if (Array.isArray(value) && !value.includes(expectedValue)) {
          return false;
        } else if (value !== expectedValue) {
          return false;
        }
      }
    }
    return true;
  }

  get allChoices() {
    if (this.dataSources.length === 0) {
      return this.choices;
    }

    let choices = this.choices;
    for (const dataSource of this.dataSources) {
      if (dataSource.choices) {
        choices = choices.concat(dataSource.choices);
      }
    }
    return choices;
  }

  /**
   * @inheritdoc
   * @return {String[]|String} The choice or choices of this option field
   *                           depending on the format of this field.
   */
  getValue() {
    if (this.format === 'dropdown') {
      return this.selectedChoice;
    } else if (this.format === 'checkbox') {
      if (this.checkboxFormat === 'simple') {
        return this.choices[0].selected;
      }
      const chosen = [];
      for (const choice of this.choices) {
        if (choice.selected) {
          chosen.push(choice.key);
        }
      }
      return chosen;
    }
  }

  /**
   * @inheritdoc
   * @param {String|String[]} value The new choice or choices depending on the
   *                                format of this field.
   */
  setValue(value) {
    if (Array.isArray(value) && this.format === 'checkbox') {
      for (const choice of this.choices) {
        if (value.includes(choice.key)) {
          choice.selected = true;
        } else if (choice.selected) {
          choice.selected = false;
        }
      }
    } else {
      for (const choice of this.choices) {
        if (choice.key === value) {
          choice.selected = true;
        } else if (choice.selected) {
          choice.selected = false;
        }
      }
    }
  }

  /**
   * Call {@link #setValue()} and {@link #onChange()}
   * @param {String|String[]} value The new choice or choices depending on the
   *                                format of this field.
   */
  selectionChanged(value) {
    this.setValue(value);
    this.onChange();
  }

  /**
   * Called by Aurelia when it sets the current selection to selectedChoice.
   */
  selectedChoiceChanged() {
    this.setValue(this.selectedChoice);
  }

  /**
   * @return {String} The name of the HTML file that displays the choices in the
   *                  format specified by {@link #format}.
   * @private
   */
  getViewStrategy() {
    return `resources/elements/optionfield-${this.format}.html`;
  }
}
