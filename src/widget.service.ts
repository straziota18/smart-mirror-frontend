import { Injectable, signal, WritableSignal } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { Widget } from './widget';

interface WebSocketMessage {
  msg: 'widgets' | 'update_widget';
  data: {[widget_id: string]: Widget} | Widget;
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
            current[new_widget.widget_id] = new_widget;
            return current;
          });
        }
      },
      error: err => console.error(`Received WS error: ${err}`)
    })
  }

  updateWidgetPosition(widget: Widget) {
    this.ws.next({msg: 'update_widget', data: widget});
  }
}
