import {typeFormatChoices, enumArray} from './types'

const parameterType = {
  'type': 'option',
  'columns': '4',
  'placeholder': 'Type name',
  'format': 'dropdown',
  'choices': ['string', 'integer', 'number', 'boolean', 'array']
}

const toplevelParameterType = JSON.parse(JSON.stringify(parameterType))
toplevelParameterType.conditions = {
  '../in': ['path', 'query', 'header', 'formData']
}
toplevelParameterType.choices.push({
  'key': 'file',
  'conditions': {
    '../in': 'formData'
  }
})

const parameterFormat = {
  'type': 'option',
  'format': 'dropdown',
  'choices': typeFormatChoices,
  'i18n': {
    'path': 'form.types.item.format'
  }
}

const toplevelParameterFormat = JSON.parse(JSON.stringify(parameterFormat))
toplevelParameterFormat.conditions = {
  '../in': ['path', 'query', 'header', 'formData']
}

const parameterCollectionFormat = {
  'type': 'option',
  'format': 'dropdown',
  'label': 'Collection format',
  'choices': ['csv', 'ssv', 'tsv', 'pipes'],
  'conditions': {
    '../type': 'array'
  }
}

const toplevelParameterCollectionFormat = JSON.parse(JSON.stringify(parameterCollectionFormat))
toplevelParameterCollectionFormat.conditions['../type'] = 'array'
toplevelParameterCollectionFormat.choices.push({
  'key': 'multi',
  'label': 'Parameter separation (foo=bar&foo=baz)',
  'conditions': [
    '../in': ['query', 'formData']
  ]
})

export const parameterItemDefinition = {
  'type': 'object',
  'Path': 'form.parameter',
  'i18n': {
    'keys': {
      'label': 'form.parameter.parameter.items.label'
    }
  },
  'hideValueIfEmpty': false,
  'children': {
    'type': parameterType,
    'format': parameterFormat,
    'collectionFormat': parameterCollectionFormat,
    'items': {
      'type': 'lazylink',
      'target': '/parameter-item-definition',
      'conditions': {
        '../type': 'array'
      }
    }
  }
}

const toplevelParameterItemDefinition = Object.assign({}, parameterItemDefinition)
toplevelParameterItemDefinition.conditions = {
  '../in': ['path', 'query', 'header', 'formData'],
  '../type': 'array'
}

const enumIfNotInBody = Object.assign({}, enumArray)
enumIfNotInBody.conditions = {
  '../in': ['path', 'query', 'header', 'formData']
}

export const parameter = {
  'type': 'selectable',
  'i18n': {
    'path': 'form.parameter',
    'interpolations': {
      'name': '${#/:child/name}'
    }
  },
  'setValueListeners': [
    (field, newValue) =>
      field.setType(newValue.hasOwnProperty('$ref') ? 'reference' : 'parameter')
  ],
  'types': {
    'parameter': {
      'i18n': {
        'path': 'form.parameter'
      },
      'setValueListeners': [
        (field, newValue) => {
          if (newValue.hasOwnProperty('in')) {
            field.children.in.setValue(newValue.in)
          }
        }
      ],
      'type': 'object',
      'children': {
        'name': {
          'type': 'text',
          'hideValueIfEmpty': false
        },
        'in': {
          'type': 'option',
          'format': 'dropdown',
          'label': 'Location',
          'choices': ['path', 'query', 'header', 'formData', 'body'],
          'hideValueIfEmpty': false
        },
        'description': {
          'type': 'textarea'
        },
        'required': {
          'type': 'option',
          'format': 'checkbox'
        },
        'schema': {
          'type': 'lazylink',
          'target': '/global-definitions/types/:item',
          'overrides': {
            'labelFormat': 'Body schema',
            'legendChildren/name': null,
            'legendChildren/x-oad-type/columns': 8
          },
          'hideValueIfEmpty': false,
          'conditions': {
            '../in': 'body'
          }
        },
        'allowEmptyValue': {
          'type': 'option',
          'format': 'checkbox',
          'label': 'Allow empty value?',
          'conditions': {
            '../in': ['path', 'query', 'header', 'formData']
          }
        },
        'type': toplevelParameterType,
        'format': toplevelParameterFormat,
        'collectionFormat': toplevelParameterCollectionFormat,
        'items': toplevelParameterItemDefinition,
        'enum': enumIfNotInBody
      }
    },
    'reference': {
      'type': 'object',
      'i18n': {
        'path': 'form.parameter'
      },
      'children': {
        '$ref': {
          'type': 'option',
          'format': 'dropdown',
          'label': 'Target',
          'hideIfNoChoices': false,
          'dataSources': [{
            'source': '/global-definitions/parameters',
            'key': '#/parameters/${#:key}',
            'label': 'Parameter ${#:key}'
          }]
        }
      }
    }
  }
}

export const namedParameter = $.extend(true, {}, parameter)
namedParameter.keyKey = 'paramName'
namedParameter.keyPlaceholder = 'Enter name...'
namedParameter.i18n.interpolations = {
  'name': '${#:key}'
}
namedParameter.i18n.keys = {
  'label': 'form.global-definitions.parameters.item.label'
}

export const parameters = {
  'type': 'array',
  'format': 'map',
  'collapseManagement': true,
  'isCollapsible': false,
  'addIndexToChildLabel': false,
  'keyField': 'paramName',
  'newItemText': 'New Parameter',
  'item': namedParameter
}
