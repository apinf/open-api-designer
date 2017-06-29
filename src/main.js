import 'babel-polyfill'
import {TCustomAttribute, Backend} from 'aurelia-i18n'
import environment from './environment'

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature('resources')
    .plugin('aurelia-i18n', (instance) => {
      TCustomAttribute.configureAliases(['t'])

      instance.i18next.use(Backend.with(aurelia.loader))

      return instance.setup({
        backend: {
          loadPath: './lang/{{lng}}.json'
        },
        attributes: ['t'],
        lng: 'en',
        fallbackLng: 'en',
        debug: environment.debug
      })
    })

  if (environment.debug) {
    aurelia.use.developmentLogging()
  }

  if (environment.testing) {
    aurelia.use.plugin('aurelia-testing')
  }

  aurelia.start().then(() => aurelia.setRoot())
}
