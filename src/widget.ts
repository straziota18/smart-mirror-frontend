export type WidgetType = 'time' | 'date' | 'weather';

export interface Widget {
    widget_id: string;
    widget_type: WidgetType;
    x: number;
    y: number;
    size: number;
}

export interface AbstractTimeWidget extends Widget {
    tz: string;
}