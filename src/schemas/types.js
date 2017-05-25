export const types = {
  'type': 'array',
  'format': 'map',
  'keyField': 'name',
  'showValueInParent': false,
  'addIndexToChildLabel': false,
  'collapseManagement': true,
  'item': {
    'type': 'object',
    'label': 'Type ${#/name}',
    'legendChildren': {
      'type': {
        'type': 'option',
        'columns': '4',
        'placeholder': 'Type name',
        'format': 'dropdown',
        'choices': ['string', 'integer', 'number', 'array', 'object', 'reference', 'null']
      },
      'name': {
        'type': 'text',
        'columns': '4',
        'label': 'Enter key...'
      }
    },
    'children': {
      '$ref': {
        'type': 'text',
        'label': 'Target',
        'conditions': {
          '../type': 'reference'
        }
      },
      'title': {
        'type': 'text',
        'conditions': {
          '../type': ['string', 'integer', 'number', 'array', 'object', 'null']
        }
      },
      'description': {
        'type': 'textarea',
        'conditions': {
          '../type': ['string', 'integer', 'number', 'array', 'object', 'null']
        }
      },
      'format': {
        'type': 'option',
        'format': 'dropdown',
        'choices': [
          {
            'key': 'int32',
            'label': '32-bit integer',
            'conditions': {
              '../type': 'integer'
            }
          },
          {
            'key': 'int64',
            'label': '64-bit integer',
            'conditions': {
              '../type': 'integer'
            }
          },
          {
            'key': 'float',
            'label': '32-bit floating point',
            'conditions': {
              '../type': 'number'
            }
          },
          {
            'key': 'double',
            'label': '64-bit floating point',
            'conditions': {
              '../type': 'number'
            }
          }
        ]
      },
      'item': {
        'type': 'lazylink',
        'target': '/types/:item',
        'overrides': {
          'labelFormat': 'Array item',
          'legendChildren/name': null,
          'legendChildren/type/columns': 8
        },
        'conditions': {
          '../type': 'array'
        }
      },
      'properties': {
        'type': 'lazylink',
        'target': '/types',
        'overrides': {
          'labelFormat': 'Properties',
          '#/:item;labelFormat': 'Property'
        },
        'conditions': {
          '../type': 'object'
        }
      }
    }
  }
};
