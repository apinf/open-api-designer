export const paths = {
  'type': 'array',
  'format': 'map',
  'keyField': 'name',
  'addIndexToChildLabel': false,
  'collapseManagement': true,
  'item': {
    'type': 'object',
    'label': 'Path ${#/name}',
    'legendChildren': {
      'name': {
        'type': 'text',
        'label': 'Enter path...'
      }
    },
    'children': {
      'title': {
        'type': 'text',
        'conditions': {
          '../type': ['string', 'integer', 'number', 'array', 'object', 'null']
        }
      },
      'methods': {
        'type': 'array',
        'format': 'map',
        'keyField': 'method',
        'item': {
          'label': 'Method definition',
          'type': 'object',
          'legendChildren': {
            'method': {
              'type': 'option',
              'format': 'dropdown',
              'choices': [
                {'key': 'get', 'label': 'GET'},
                {'key': 'put', 'label': 'PUT'},
                {'key': 'post', 'label': 'POST'},
                {'key': 'delete', 'label': 'DELETE'},
                {'key': 'options', 'label': 'OPTIONS'},
                {'key': 'head', 'label': 'HEAD'},
                {'key': 'patch', 'label': 'PATCH'}
              ]
            }
          },
          'children': {
            'operationId': {
              'label': 'Operation ID',
              'type': 'text'
            },
            'summary': {
              'type': 'text'
            },
            'description': {
              'type': 'textarea'
            },
            'tags': {
              'type': 'array',
              'item': {
                'type': 'text'
              }
            }
          }
        }
      }
    }
  }
};
