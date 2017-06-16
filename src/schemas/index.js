import {header} from './header';
import {mime} from './mime';
import {security} from './security';
import {tags} from './tags';
import {paths} from './paths';
import {types} from './types';

export const fieldsToShow = {
  'header': [
    'info',
    'contact',
    'license',
    'host',
    'basePath',
    'schemes'
  ],
  'types': ['definitions'],
  'mime': ['consumes', 'produces'],
  'global-security': ['security', 'securityDefinitions']
};

export const schema = {
  'type': 'object',
  'children': {
    header,
    mime,
    'global-security': security,
    tags,
    paths,
    types,
    'security': {
      'type': 'link',
      'target': '/global-security/requirements'
    },
    'securityDefinitions': {
      'type': 'link',
      'target': '/global-security/definitions'
    },
    'definitions': {
      'type': 'link',
      'target': '/types'
    },
    'info': {
      'type': 'link',
      'target': '/header/info'
    },
    'contact': {
      'type': 'link',
      'target': '/header/contact'
    },
    'license': {
      'type': 'link',
      'target': '/header/license'
    },
    'host': {
      'type': 'link',
      'target': '/header/host/host'
    },
    'basePath': {
      'type': 'link',
      'target': '/header/host/basePath'
    },
    'schemes': {
      'type': 'link',
      'target': '/header/host/schemes'
    },
    'consumes': {
      'type': 'link',
      'target': '/mime/consumes'
    },
    'produces': {
      'type': 'link',
      'target': '/mime/produces'
    }
  }
};
