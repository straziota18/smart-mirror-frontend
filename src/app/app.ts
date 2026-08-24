import { Component, computed, inject } from '@angular/core';
import { WidgetService } from '../widget.service';
import { CdkDrag, CdkDragEnd, Point } from '@angular/cdk/drag-drop';
import { Widget } from '../widget';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [CdkDrag]
})
export class App {

  private widgetService: WidgetService = inject(WidgetService);

  readonly widgets = computed(() => {
    return Object.values(this.widgetService.widgets())
  });

  onDragEnded(widget: Widget, e: CdkDragEnd) {
    const parentRect = e.source.element.nativeElement.parentElement!.getBoundingClientRect();
    const freeDragRect = e.source.getFreeDragPosition()
    widget.x = freeDragRect.x / parentRect.width;
    widget.y = freeDragRect.y / parentRect.height;

    this.widgetService.updateWidgetPosition(widget);
  }

  getPosition(parent: HTMLElement, widget: Widget): Point {
    const parentRect = parent.getBoundingClientRect();
    return {
      x: widget.x * parentRect.width,
      y: widget.y * parentRect.height
    };
  }
}
