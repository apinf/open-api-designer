import {parseJSON} from './resources/jsonparser';
import {schema, fieldsToShow} from './schemas/index';
import YAML from 'yamljs';
import $ from 'jquery';

export class App {
  constructor() {
    // Allow access from browser console
    window.$oai = this;

    try {
      this.forms = parseJSON('swagger', JSON.parse(JSON.stringify(schema)));
      if (window.localStorage['openapi-v2-design']) {
        this.forms.setValue(JSON.parse(window.localStorage['openapi-v2-design']));
      }
    } catch (exception) {
      console.log(exception);
      this.exception = exception;
      return;
    }

    this.activeForm = 'about';

    window.onhashchange = () => {
      const formID = window.location.hash.substr(2) || 'about';
      if (typeof this.activeForm === 'object') {
        this.activeForm.show = false;
      }
      if (formID === 'about') {
        this.activeForm = 'about';
      } else if (this.forms.hasChild(formID)) {
        this.activeForm = this.forms.getChild(formID);
        this.activeForm.show = true;
      } else {
        return;
      }
      $('.nav > .nav-link.open').removeClass('open');
      $(`#nav-${formID}`).addClass('open');
    };

    this.forms.addChangeListener(() => this.saveFormLocal());
  }

  attached() {
    if (window.onhashchange) {
      window.onhashchange();
    }
  }

  download(type) {
    let data;
    if (type === 'json') {
      data = this.json;
    } else if (type === 'yaml') {
      data = this.yaml;
    } else {
      return;
    }

    // Add an anchor element that has the data as the href attribute, then click
    // the element to download the data.
    const blob = new Blob([data], {type: 'text/json'});
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, `swagger.${type}`);
    } else {
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(blob);
      downloadLink.download = `swagger.${type}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  }

  delete() {
    let userInput = confirm('Do you want to delete locally cached form data? \nThis action can not be undone.');
    if (userInput === true) {
      delete localStorage['openapi-v2-design'];
      location.reload();
    }
  }

  getFormData() {
    const data = this.forms.getValue();
    data.swagger = '2.0';
    return data;
  }

  get yaml() {
    return YAML.stringify(this.getFormData(), 10, 2);
  }

  get json() {
    const data = JSON.stringify(this.getFormData(), '', '  ');
    return data;
  }

  saveFormLocal() {
    window.localStorage['openapi-v2-design'] = JSON.stringify(this.getFormData());
  }

  get currentFormJSON() {
    if (fieldsToShow.hasOwnProperty(this.activeForm.id)) {
      const rawData = this.getFormData();
      let output = '';
      for (const field of fieldsToShow[this.activeForm.id]) {
        output += `"${field}": ${JSON.stringify(rawData[field], '', '  ')}\n`;
      }
      return output;
    }
    const data = JSON.stringify(this.activeForm.getValue(), '', '  ');
    return `"${this.activeForm.id}": ${data}`;
  }
}
