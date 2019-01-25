import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the ConvertHoursPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'convertHours'
})
export class ConvertHoursPipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  transform(value: string) {
    return value.toLowerCase();
    // return this.someFuunction(value);
  }

  //** this is the original hours array */
  // [ // ** example I
  //   [[6, 24]],
  //   [[6, 24]],
  //   [[6, 24]],
  //   [[6, 24]],
  //   [[6, 24]],
  //   [[6, 24]],
  //   [[6, 24]]
  // ]
  // [// ** example II
  //   [[0, 1],[5.5, 24]],
  //   [[5.5, 24]],
  //   [[5.5, 24]],
  //   [[5.5, 24]],
  //   [[5.5, 24]],
  //   [[5.5, 24]],
  //   [[0, 1],[5.5, 24]]
  // ]
  //** conver the above a set of arrays into day hours */

  convertArrayHoursToString(array) {
    // let satLast: [] = array[6][1];
    // if (satLast) {
    //   console.log(satLast, ' indeed existed');
    // } else {
    //   console.log('satLast didnt exists');
    // }
    let num: number = 0;
    let storedMidnight: object[] = [];
    let storedDaytime: object[] = [];
    function separateMidnightAndDaytime(array) {
      for (let arr of array) {
        if (arr.length > 1) {
          console.log(arr[0]);
          if (num === 0) {
            storedMidnight[array.length - 1] = arr[0];
          } else if (num === array.length - 1) {
            storedMidnight[0] = arr[0];
          } else {
            storedMidnight[num + 1] = arr[0];
          }
          storedDaytime[num] = arr[1];
        } else {
          storedDaytime[num] = arr[0];
        }
        num++;
      }
      console.log(storedMidnight, ' is the storedMidnight array');
      console.log(storedDaytime, ' is the storedDaytime array');
      return;
    }
    separateMidnightAndDaytime(array);
    let results = [];
    function combineMidnightAndDaytime() {
      // var maxCallback = ( acc, cur ) => acc[]], cur.x );
      // let num2 = 0;
      // let num3 = 0;
      for (let dayItem in storedDaytime) {
        results[dayItem] = storedDaytime[dayItem];
        for (let midItem in storedMidnight) {
          if (midItem === dayItem) {
            console.log(results[dayItem]);
            results[dayItem] = results[dayItem].concat(storedMidnight[midItem]);
          }
        }
      }
      console.log(results, 'is the combined results?');
    }
    combineMidnightAndDaytime();
    let summarizedResults = [];
    function cleanMidnightAndDaytime() {
      for (let resultNum in results) {
        if (results[resultNum].length > 2) {
          console.log('there was night time indded');
          let keepFirstIndex: number = results[resultNum][0];
          console.log(keepFirstIndex);
          console.log(results[resultNum]);
          const reducer = (accumulator, currentValue) => {
            // console.log(currentIndex);
            // currentIndex !== 1 ? accumulator + currentValue : 0;
            return accumulator + currentValue;
          };
          let temp = results[resultNum].reduce(reducer);
          // let temp = results[resultNum].reduce((a, b) => {
          //   return a + b;
          // });
          console.log(temp);
          temp = temp - keepFirstIndex;
          summarizedResults[resultNum] = [keepFirstIndex, temp];
          // summarizedResults[resultNum].unshift(keepFirstIndex);
        } else {
          summarizedResults.push(results[resultNum]);
        }
      }
      console.log(summarizedResults, 'is the summarizedResults results?');
    }
    cleanMidnightAndDaytime();

    // let oneDayHrObj: OpenHours;
    // function toObject(summarizedResults) {
    //   let convertedHrArr: StringArray;
    //   for (var i = 0; i < summarizedResults.length; ++i) {
    //     console.log(summarizedResults.length, ' is the length');
    //     if (summarizedResults[i] !== undefined) {
    //       console.log(summarizedResults[i], ' the one array');
    //       switch (i) {
    //         case 0:
    //           oneDayHrObj['day'] = 'Sunday';
    //           console.log('it was 0, Sunday');
    //           console.log('it was 0, Sunday');
    //           break;
    //         case 1:
    //           oneDayHrObj['day'] = 'Monday';
    //           // convertedHrArr[i]['day'] = 'Monday';
    //           console.log('it was 1, Monday');
    //           break;
    //         case 2:
    //           oneDayHrObj['day'] = 'Tuesday';
    //           // convertedHrArr[i]['day'] = 'Tuesday';
    //           console.log('it was 2, Tuesday');
    //           break;
    //         case 3:
    //           oneDayHrObj['day'] = 'Wednesday';
    //           // convertedHrArr[i]['day'] = 'Wednesday';
    //           console.log('it was 3, Wednesday');
    //           break;
    //         case 4:
    //           oneDayHrObj['day'] = 'Thursday';
    //           // convertedHrArr[i]['day'] = 'Thursday';
    //           console.log('it was 4, Thursday');
    //           break;
    //         case 5:
    //           oneDayHrObj['day'] = 'Friday';
    //           // convertedHrArr[i]['day'] = 'Friday';
    //           console.log('it was 5, Friday');
    //           break;
    //         case 6:
    //           oneDayHrObj['day'] = 'Saturday';
    //           // convertedHrArr[i]['day'] = 'Saturday';
    //           console.log('it was 6, Saturday');
    //           break;
    //         default:
    //           console.log('none of switch case matched..');
    //       }
    //       oneDayHrObj['open'] = summarizedResults[i][0];
    //       console.log(oneDayHrObj['open'], ' is the open time');
    //       oneDayHrObj['close'] = summarizedResults[i][1];
    //       console.log(oneDayHrObj['close'], ' is the close time');
    //       // convertedHrArr[i]['open'] = summarizedResults[i][0];
    //       // convertedHrArr[i]['close'] = summarizedResults[i][1];
    //       console.log(
    //         oneDayHrObj,
    //         ' is oneDayHrObj and should be diff every time'
    //       );
    //       // convertedHrArr.push(oneDayHrObj);
    //       console.log(convertedHrArr, ' is collection of hours???');
    //       // oneDayHrObj[i] = summarizedResults[i];
    //     }
    //     // convertedHrArr[i] = oneDayHrObj;
    //     console.log(convertedHrArr[i], ' is convertedHrArr[i]??');
    //     console.log(convertedHrArr, ' is convertedHrArr??');
    //   }
    //   console.log(convertedHrArr, ' is convertedHrArr??');
    //   // return rv;
    // }
    // toObject(summarizedResults);

    // function craftHtmlForHours() {
    //   // oneDayHrObj = { ...summarizedResults };
    //   console.log(oneDayHrObj, 'is the new hour obj??');
    //   for (let dayHour of summarizedResults) {
    //     console.log(dayHour);
    //   }
    // }
    // craftHtmlForHours();
  }
}
