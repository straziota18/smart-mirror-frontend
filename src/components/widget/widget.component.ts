import { Component, Input } from '@angular/core';
import { AbstractTimeWidget, Widget } from '../../widget';
import { NgStyle } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';

@Component({
  selector: 'app-widget',
  imports: [NgStyle],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.css',
})
export class WidgetComponent {
  @Input()
  widget!: Widget;

  // time/date widget
  currentTime = toSignal(
    interval(1000).pipe(map(() => new Date())),
    { initialValue: new Date() }
  );

  formatTime(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit', // Included seconds to demonstrate live updates
      hour12: false
    }).format(date);
  }

  formatDate(date: Date, timeZone: string): string {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  get timeWidget(): AbstractTimeWidget {
    return this.widget as AbstractTimeWidget;
  }
}
