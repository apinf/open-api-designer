import {externalDocs} from './externalDocs'

export const tags = {
  'type': 'array',
  'isCollapsible': false,
  'item': {
    'type': 'object',
    'label': 'Tag',
    'children': {
      'name': {
        'type': 'text'
      },
      'description': {
        'type': 'textarea'
      },
      'externalDocs': externalDocs
    }
  }
}
