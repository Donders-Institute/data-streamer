import moment, { Moment } from 'moment';

export const dateFormat = 'YYYY-MM-DD';
export const timeFormat = 'HH:mm';

export function calculateNumRecurringBookings(
  startDate: Moment | undefined,
  recurrencyEndDate: Moment | undefined,
  recurrencyFrequency: string
) {
  let numRecurringBookings = 0;
  if (startDate && recurrencyEndDate) {
    let timeStart: any = new Date(startDate.format(dateFormat));
    let timeEnd: any = new Date(recurrencyEndDate.format(dateFormat));

    if (recurrencyFrequency === "daily") {
      let dayDiff = Math.round((timeEnd-timeStart)/(1000*60*60*24));
      numRecurringBookings = dayDiff;

    } else if (recurrencyFrequency === "weekly") {
      let weekDiff = Math.round((timeEnd-timeStart)/(1000*60*60*24*7));
      numRecurringBookings = weekDiff;

    } else if (recurrencyFrequency === "bi-weekly") {
      let twoWeekDiff = Math.round((timeEnd-timeStart)/(1000*60*60*24*7*2));
      numRecurringBookings = twoWeekDiff;

    } else if (recurrencyFrequency === "every 3 weeks") {
      let threeWeekDiff = Math.round((timeEnd-timeStart)/(1000*60*60*24*7*3));
      numRecurringBookings = threeWeekDiff;

    } else if (recurrencyFrequency === "every 4 weeks") {
      let fourWeekDiff = Math.round((timeEnd-timeStart)/(1000*60*60*24*7*4));
      numRecurringBookings = fourWeekDiff;

    } else {
      alert(`not yet supported: recurrencyFrequency = ${recurrencyFrequency}`);
    }
  }
  return numRecurringBookings;
};

export function calculateRecurrencyEndDate(
  startDate: Moment | undefined,
  recurrencyFrequency: string,
  numRecurrentBookings: number | undefined
) {
  let recurrencyEndDate = startDate;

  if (startDate && numRecurrentBookings) {
    let timeStart: any = new Date(startDate.format(dateFormat));
    let msDiff = 0;
  
    if (recurrencyFrequency === "daily") {
      msDiff = numRecurrentBookings*1000*60*60*24;

    } else if (recurrencyFrequency === "weekly") {
      msDiff = numRecurrentBookings*1000*60*60*24*7;

    } else if (recurrencyFrequency === "bi-weekly") {
      msDiff = numRecurrentBookings*1000*60*60*24*7*2;

    } else if (recurrencyFrequency === "every 3 weeks") {
      msDiff = numRecurrentBookings*1000*60*60*24*7*3;

    } else if (recurrencyFrequency === "every 4 weeks") {
      msDiff = numRecurrentBookings*1000*60*60*24*7*4;

    } else {
      alert(`not yet supported: recurrencyFrequency = ${recurrencyFrequency}`);
    }

    let timeEnd = timeStart.getTime() + msDiff;
    recurrencyEndDate = moment(new Date(timeEnd), dateFormat); 
  }

  return recurrencyEndDate;
};
