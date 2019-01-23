import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the StoreNamePipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'storeName'
})
export class StoreNamePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string) {
    return this.splitAndGrab(value);
  }
  splitAndGrab(value: string) {
    let newValue: string[] = new Array();
    if (value.indexOf('Gas') >= 0) {
      console.log('the name included Gas');
      if (value === '76 Gas Station') {
        newValue = value.split(' Station');
        // console.log(newValue, ' from the first 76 if within Gas');
      } else {
        newValue = value.split(' Gas Station');
        // console.log(newValue, ' from the else if within Gas');
      }
      // console.log(newValue[0]);
      return newValue[0];
    }
    return value;
  }
}
