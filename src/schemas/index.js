import {header} from './header';
import {mime} from './mime';
import {securityDefinitions} from './security';
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
  'mime': ['consumes', 'produces']
};

export const schema = {
  'type': 'object',
  'children': {
    header,
    mime,
    securityDefinitions,
    tags,
    paths,
    types,
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
