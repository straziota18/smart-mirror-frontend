import { Injectable, signal, WritableSignal } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Widget } from './widget';
import * as _ from 'lodash';

interface WebSocketMessage {
  msg: 'widgets' | 'update_widget' | 'new_widget' | 'delete_widget';
  data: {[widget_id: string]: Widget} | Widget | string;
}

@Injectable({
  providedIn: 'root',
})
export class WidgetService {
  readonly widgets: WritableSignal<{[widget_id: string]: Widget}> = signal({});
  private ws = webSocket<WebSocketMessage>('/ws');

  constructor() {
    this.ws.subscribe({
      next: it => {
        if (it['msg'] === 'widgets') {
          this.widgets.set(it['data'] as {[widget_id: string]: Widget});
        } else if (it['msg'] === 'update_widget') {
          const new_widget = it['data'] as Widget;
          this.widgets.update(current => {
            const newResult = _.cloneDeep(current);
            newResult[new_widget.widget_id] = new_widget;
            return newResult;
          });
        } else if (it['msg'] === 'delete_widget') {
          this.widgets.update(current => {
            const newResult = _.cloneDeep(current);
            delete newResult[it['data'] as string];
            return newResult;
          });
        }
      },
      error: err => console.error(`Received WS error: ${err}`)
    })
  }

  updateWidget(widget: Widget) {
    this.ws.next({msg: 'update_widget', data: widget});
  }

  createWidget(widget: Widget) {
    this.ws.next({msg: 'new_widget', data: widget});
  }

  deleteWidget(widgetId: string) {
    this.ws.next({msg: 'delete_widget', data: widgetId});
  }
}
