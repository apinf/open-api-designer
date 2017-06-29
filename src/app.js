import {inject} from 'aurelia-framework'
import {I18N} from 'aurelia-i18n'
import {EventAggregator} from 'aurelia-event-aggregator'
import {parseJSON} from './resources/jsonparser'
import {Field} from './resources/elements/abstract/field'
import {schema, fieldsToShow} from './schemas/index'
import YAML from 'yamljs'
import $ from 'jquery'

@inject(I18N, EventAggregator)
export class App {
  constructor(i18n, ea) {
    Field.internationalizer = i18n
    Field.eventAggregator = ea
    // Allow access from browser console
    window.$oai = this

    try {
      const pointerlessSchema = $.extend(true, {}, schema)
      this.forms = parseJSON('form', pointerlessSchema)
      if (window.localStorage['openapi-v2-design']) {
        const savedData = JSON.parse(window.localStorage['openapi-v2-design'])
        this.forms.setValue(savedData)
      }
    } catch (exception) {
      console.log(exception)
      this.exception = exception
      return
    }

    this.activeForm = 'about'

    window.onhashchange = () => {
      const formID = window.location.hash.substr(2) || 'about'
      if (typeof this.activeForm === 'object') {
        this.activeForm.show = false
      }
      if (formID === 'about') {
        this.activeForm = 'about'
      } else if (this.forms.hasChild(formID)) {
        this.activeForm = this.forms.getChild(formID)
        this.activeForm.show = true
      } else {
        return
      }
      $('.nav > .nav-link.open').removeClass('open')
      $(`#nav-${formID}`).addClass('open')
    }

    this.forms.addChangeListener(() => this.saveFormLocal())
  }

  attached() {
    if (window.onhashchange) {
      window.onhashchange()
    }
  }

  importFile() {
    const fileInput = $('<input/>', { type: 'file' })
    fileInput.css({display: 'none'})
    fileInput.appendTo('body')
    fileInput.trigger('click')

    fileInput.change(() => {
      const file = fileInput[0].files[0]
      const reader = new FileReader()
      reader.addEventListener('load', () => {
        let data
        try {
          if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
            data = YAML.parse(reader.result)
          } else {
            data = JSON.parse(reader.result)
          }
        } catch (ex) {
          console.error(ex)
          return
          // Oh noes!
        }
        this.forms.setValue(data)
      }, false)
      reader.readAsText(file)
    })
  }

  importPasted() {
    const rawData = $(this.pasteImportData).val()
    let data
    try {
      data = YAML.parse(rawData)
    } catch (_) {
      try {
        data = JSON.parse(rawData)
      } catch (ex) {
        console.error(ex)
        return
        // Oh noes!
      }
    }
    this.forms.setValue(data)
    this.closePasteImport()
  }

  download(type) {
    let data
    if (type === 'json') {
      data = this.json
    } else if (type === 'yaml') {
      data = this.yaml
    } else {
      return
    }

    // Add an anchor element that has the data as the href attribute, then click
    // the element to download the data.
    const blob = new Blob([data], {type: 'text/json'})
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, `swagger.${type}`)
    } else {
      const downloadLink = document.createElement('a')
      downloadLink.href = window.URL.createObjectURL(blob)
      downloadLink.download = `swagger.${type}`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  delete() {
    let userInput = confirm('Do you want to delete locally cached form data? \nThis action can not be undone.')
    if (userInput === true) {
      delete localStorage['openapi-v2-design']
      location.reload()
    }
  }

  openInfo() {
    $(this.infoModal).removeClass('hidden')
  }

  closeInfo() {
    $(this.infoModal).addClass('hidden')
  }

  openPasteImport() {
    $(this.pasteModal).removeClass('hidden')
  }

  closePasteImport() {
    $(this.pasteModal).addClass('hidden')
  }

  getFormData() {
    const data = this.forms.getValue()
    data.swagger = '2.0'
    return data
  }

  get yaml() {
    return YAML.stringify(this.getFormData(), 10, 2)
  }

  get json() {
    const data = JSON.stringify(this.getFormData(), '', '  ')
    return data
  }

  saveFormLocal() {
    window.localStorage['openapi-v2-design'] = JSON.stringify(this.getFormData())
  }

  get currentFormJSON() {
    if (fieldsToShow.hasOwnProperty(this.activeForm.id)) {
      const rawData = this.getFormData()
      let output = ''
      for (const field of fieldsToShow[this.activeForm.id]) {
        if (rawData[field]) {
          output += `"${field}": ${JSON.stringify(rawData[field], '', '  ')}\n`
        }
      }
      return output
    }
    const data = this.activeForm.getValue()
    if (!data || (typeof data === 'object' && Object.entries(data).length === 0)) {
      return ''
    }
    const stringData = JSON.stringify(data, '', '  ')
    return `"${this.activeForm.id}": ${stringData}`
  }
}
