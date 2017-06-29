import {schemes} from './schemes'
import {externalDocs} from './externalDocs'

export const header = {
  'type': 'object',
  'showValueInParent': false,
  'isCollapsible': false,
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
          'type': 'textarea',
          'hideValueIfEmpty': true
        },
        'termsOfService': {
          'type': 'text',
          'label': 'Terms of Service',
          'hideValueIfEmpty': true
        },
        'contact': {
          'type': 'object',
          'hideValueIfEmpty': true,
          'children': {
            'name': {
              'type': 'text',
              'hideValueIfEmpty': true
            },
            'email': {
              'type': 'text',
              'hideValueIfEmpty': true
            },
            'url': {
              'type': 'text',
              'label': 'URL',
              'hideValueIfEmpty': true
            }
          }
        },
        'license': {
          'type': 'object',
          'hideValueIfEmpty': true,
          'children': {
            'name': {
              'type': 'text',
              'hideValueIfEmpty': true
            },
            'url': {
              'type': 'text',
              'hideValueIfEmpty': true
            }
          }
        }
      }
    },
    'host': {
      'label': 'Host location',
      'type': 'object',
      'showValueInParent': false,
      'children': {
        'host': {
          'type': 'text'
        },
        'basePath': {
          'type': 'text',
          'label': 'Base path'
        },
        'schemes': schemes
      }
    },
    'externalDocs': externalDocs
  }
}
