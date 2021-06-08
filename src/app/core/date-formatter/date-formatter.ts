import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Globals } from '../../app.globals';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return super.transform(value, Globals.DATE_FMT);
  }
}

@Pipe({
  name: 'yearDateFormat'
})
export class YearDateFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return super.transform(value, Globals.YEAR_DATE_FMT);
  }
}

@Pipe({
  name: 'timeFormat'
})
export class TimeFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return super.transform(value, Globals.TIME_FMT);
  }
}

@Pipe({
  name: 'dateTimeFormat'
})
export class DateTimeFormatPipe extends DatePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return super.transform(value, Globals.DATE_TIME_FMT);
  }
}