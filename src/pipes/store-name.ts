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
   * Takes the "name" value passed in the template and convert it to desired format
   * @param value: string
   */
  transform(value: string) {
    return this.splitAndGrab(value);
  }
  /**
   * Split the name data and grab only the name of the store except for 76 Gas Station
   * @param value
   * @returns newValue[0] or value
   */
  splitAndGrab(value: string) {
    let newValue: string[] = new Array();
    if (value.indexOf('Gas') >= 0) {
      console.log('the name included Gas');
      if (value === '76 Gas Station') {
        newValue = value.split(' Station');
      } else {
        newValue = value.split(' Gas Station');
      }
      return newValue[0];
    }
    return value;
  }
}
