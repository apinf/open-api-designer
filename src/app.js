import {parseJSON} from './resources/jsonparser';
import {schema} from './schemas/index';
import YAML from 'yamljs';
import $ from 'jquery';

export class App {
  constructor() {
    // Allow access from browser console
    window.$oai = this;

    this.forms = parseJSON('swagger', schema);
    if (window.localStorage.cachedForm) {
      this.forms.setValue(JSON.parse(window.localStorage.cachedForm));
    }

    this.activeForm = this.forms.getChild('header');
    this.activeForm.show = true;

    window.onhashchange = () => {
      const formID = window.location.hash.substr(2) || 'header';
      if (this.forms.hasChild(formID)) {
        this.activeForm.show = false;
        this.activeForm = this.forms.getChild(formID);
        this.activeForm.show = true;
        $('.nav > .nav-link.open').removeClass('open');
        $(`#nav-${formID}`).addClass('open');
      }
    };
  }

  attached() {
    window.onhashchange();
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

  get yaml() {
    return YAML.stringify(this.forms.getValue(), 10, 2);
  }

  get json() {
    const data = JSON.stringify(this.forms.getValue(), '', '  ');
    window.localStorage.cachedForm = data;
    return data;
  }

  get currentFormJSON() {
    const data = JSON.stringify(this.activeForm.getValue(), '', '  ');
    return data;
  }
}
