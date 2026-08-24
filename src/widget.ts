export interface Widget {
    widget_id: string;
    widget_type: string;
    x: number;
    y: number;
}

export interface TimeWidget extends Widget {
    tz: string;
}