import { AbstractControl } from '@angular/forms';
import * as moment from 'moment';

export class CustomValidator {

  static dateValidator(control: AbstractControl) {
    if (control && control.value) {
        let month = `0${control.value.month}`.slice(-2);
        let day = `0${control.value.day}`.slice(-2);
        let year = `${control.value.year}`;
        let dateValue = `${year}-${month}-${day}`;

        if (moment(dateValue, 'YYYY-MM-DD', true).isValid()) {
            return undefined;
        } else {
            return { 'dateFormatError': true };
        }
    }

    return undefined;
  }

  static positiveNumberValidator(control: AbstractControl) {

    if(control && control.value == '0') {
      return { 'positiveNumberError': true };
    }

    if (control && control.value) {
        let numVal = parseFloat(control.value);
        if (numVal > 0) {
            return undefined;
        } else {
            return { 'positiveNumberError': true };
        }
    }

    return undefined;
  }



  static urlValidator(control: AbstractControl) {
    if (control && control.value) {
        const URL_REGEXP = /^(http?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|in|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
        if (control.value.match(URL_REGEXP)) {
            return undefined;
        } else {
            return { 'invalidUrl': true };
        }
    }

    return undefined;
  }
}
