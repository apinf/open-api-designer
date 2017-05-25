import {parseJSON} from './resources/jsonparser';
import {schema} from './schemas/index';

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
      const formID = window.location.hash.substr(2);
      if (this.forms.hasChild(formID)) {
        this.activeForm.show = false;
        this.activeForm = this.forms.getChild(formID);
        this.activeForm.show = true;
      }
    };
    window.onhashchange();
  }

  download(type) {
    let data;
    if (type === 'json') {
      data = this.json;
    } else if (type === 'yml') {
      data = 'yaml-support-implemented: false';
    } else {
      return;
    }

    // Add an anchor element that has the data as the href attribute, then click
    // the element to download the data.
    const str = `data:text/json;charset=utf-8,${data}`;
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', str);
    downloadLink.setAttribute('download', `swagger.${type}`);
    downloadLink.innerHTML = 'Download Open API specification file';
    downloadLink.hidden = true;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }

  get json() {
    const data = JSON.stringify(this.forms.getValue(), '', '  ');
    window.localStorage.cachedForm = data;
    return data;
  }
}
