import {parseJSON} from '../resources/jsonparser';

export class Header {
  schema = {
    'type': 'object',
    'children': {
      'info': {
        'type': 'object',
        'children': {
          'title': {
            'type': 'text',
            'columns': 5
          },
          'version': {
            'type': 'text',
            'columns': 3
          },
          'description': {
            'type': 'textarea'
          },
          'termsofservice': {
            'type': 'text',
            'label': 'Terms of Service'
          }
        }
      },
      'contact': {
        'type': 'object',
        'children': {
          'name': {
            'type': 'text'
          },
          'email': {
            'type': 'text'
          },
          'url': {
            'type': 'text',
            'label': 'URL'
          }
        }
      }
    }
  }
  field = undefined

  constructor() {
    this.field = parseJSON('header', this.schema);
  }

  getViewStrategy() {
    return 'forms/form.html';
  }
}
