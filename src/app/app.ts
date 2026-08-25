import { Component, computed, inject } from '@angular/core';
import { WidgetService } from '../widget.service';
import { CdkDrag, CdkDragEnd, Point } from '@angular/cdk/drag-drop';
import { Widget } from '../widget';
import { WidgetComponent } from "../components/widget/widget.component";
import { MatDialog } from '@angular/material/dialog';
import { ControlDialogComponent } from '../components/control-dialog/control-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [CdkDrag, WidgetComponent]
})
export class App {

  private widgetService: WidgetService = inject(WidgetService);
  private matDialog: MatDialog = inject(MatDialog);
  private canOpenDialog = true;

  readonly widgets = computed(() => {
    return Object.values(this.widgetService.widgets())
  });

  onDragEnded(widget: Widget, e: CdkDragEnd) {
    const parentRect = e.source.element.nativeElement.parentElement!.getBoundingClientRect();
    const freeDragRect = e.source.getFreeDragPosition()
    widget.x = freeDragRect.x / parentRect.width;
    widget.y = freeDragRect.y / parentRect.height;

    this.widgetService.updateWidget(widget);
    e.event.preventDefault();
  }

  getPosition(parent: HTMLElement, widget: Widget): Point {
    const parentRect = parent.getBoundingClientRect();
    return {
      x: widget.x * parentRect.width,
      y: widget.y * parentRect.height
    };
  }

  editWidgetSize(widget: Widget, e: Event) {
    const wheelEvent = e as WheelEvent;
    widget.size += wheelEvent.deltaY * 0.01;
    this.widgetService.updateWidget(widget);
  }

  openDialog(widget?: Widget) {
    if (!this.canOpenDialog) {
      return;
    }
    const controlRef = this.matDialog.open(ControlDialogComponent, {
      minWidth: '400px',
      minHeight: '600px',
      data: {
        title: widget ? 'Edit widget' : 'Add widget',
        widget: widget
      }
    });

    controlRef.afterClosed().subscribe(res => {
      if (res === 'delete') {
        this.widgetService.deleteWidget(widget!.widget_id);
      } else if (!!res) {
        if (widget) {
          this.widgetService.updateWidget(res as Widget);
        } else {
          this.widgetService.createWidget(res as Widget);
        }
      }
    });
  }

  enableDialog() {
    this.canOpenDialog = true;
  }

  disableDialog() {
    this.canOpenDialog = false;
  }
}
