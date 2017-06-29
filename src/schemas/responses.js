export const response = {
  'type': 'selectable',
  'label': 'Response #$index for HTTP ${#:key}',
  'keyKey': 'status',
  'keyPlaceholder': 'Enter HTTP status code...',
  'i18n': {
    'path': 'form.response',
    'interpolations': {
      'httpStatus': '${#:key}'
    }
  },
  'setValueListeners': [
    (field, newValue) =>
      field.setType(newValue.hasOwnProperty('$ref') ? 'reference' : 'response')
  ],
  'types': {
    'response': {
      'i18n': {
        'path': 'form.response'
      },
      'type': 'object',
      'children': {
        'description': {
          'type': 'textarea'
        },
        'schema': {
          'type': 'lazylink',
          'target': '/global-definitions/types/:item',
          'hideValueIfEmpty': true,
          'overrides': {
            'i18n/keys': {
              'label': 'form.response.schema.label'
            },
            'legendChildren/name': null,
            'legendChildren/x-oad-type/columns': 8
          }
        }
      }
    },
    'reference': {
      'i18n': {
        'path': 'form.response'
      },
      'type': 'object',
      'children': {
        '$ref': {
          'type': 'option',
          'format': 'dropdown',
          'label': 'Target',
          'hideIfNoChoices': false,
          'dataSources': [{
            'source': '/global-definitions/responses',
            'key': '#/responses/${#:key}',
            'label': 'Response ${#:key}'
          }]
        }
      }
    }
  }
}

const namedResponse = $.extend(true, {}, response)
namedResponse.keyKey = 'responseName'
namedResponse.keyPlaceholder = 'Enter name...'
namedResponse.i18n.interpolations = {
  'name': '${#:key}'
}
namedResponse.i18n.keys = {
  'label': 'form.global-definitions.responses.item.label'
}

export const responses = {
  'type': 'array',
  'format': 'map',
  'collapseManagement': true,
  'isCollapsible': false,
  'addIndexToChildLabel': false,
  'keyField': 'responseName',
  'newItemText': 'New Response',
  'item': namedResponse
}
