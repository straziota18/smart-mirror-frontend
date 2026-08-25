import { T } from '@angular/cdk/keycodes';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { Widget, WidgetType } from '../../widget';

interface SelectOption {
  label: string;
  value: string | number;
}

const simpleOption: (it: string) => SelectOption = (it: string) => {
  return {label: it, value: it};
}

interface FormFieldConfig {
  key: string;
  label: string;
  field_type: 'text' | 'number' | 'select';
  defaultValue?: string | number;
  options?: SelectOption[];
  placeholder?: string;
  validators?: any[];
}

@Component({
  selector: 'app-control-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './control-dialog.component.html',
  styleUrl: './control-dialog.component.css',
})
export class ControlDialogComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  data = inject<{title: string, widget?: Widget}>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ControlDialogComponent>);

  readonly widgetTypes = [
    { value: 'time', label: 'Time' },
    { value: 'date', label: 'Date' },
    { value: 'weather', label: 'Weather' }
  ];

  widgetTypeFormGroup = this._formBuilder.group({
    widget_type: [this.data.widget ? this.data.widget.widget_type : '', Validators.required],
  });

  activeFields: FormFieldConfig[] = [];
  readonly widgetSchemas: Record<string, FormFieldConfig[]> = {
    'time': [
      { key: 'tz', label: 'Timezone', field_type: 'select', defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone, options: Intl.supportedValuesOf('timeZone').map(simpleOption), validators: [Validators.required] },
      { key: 'size', label: 'Font Size (px)', field_type: 'number', defaultValue: 24, validators: [Validators.required, Validators.min(10)] }
    ],
    'date': [
      { key: 'tz', label: 'Timezone', field_type: 'select', defaultValue: Intl.DateTimeFormat().resolvedOptions().timeZone, options: Intl.supportedValuesOf('timeZone').map(simpleOption), validators: [Validators.required] },
      { key: 'size', label: 'Font Size (px)', field_type: 'number', defaultValue: 24, validators: [Validators.required, Validators.min(10)] }
    ],
    'weather': [      
      { key: 'city', label: 'City', field_type: 'text', validators: [Validators.required] },
      { 
        key: 'unit', 
        label: 'Unit', 
        field_type: 'select', 
        defaultValue: 'metric', 
        options: [
          { label: 'Celsius (°C)', value: 'metric' },
          { label: 'Fahrenheit (°F)', value: 'imperial' }
        ],
        validators: [Validators.required] 
      },
      { key: 'size', label: 'Font Size (px)', field_type: 'number', defaultValue: 24, validators: [Validators.required, Validators.min(10)] },
    ]
  };

  widgetParametersFormGroup = this._formBuilder.group({});

  ngOnInit(): void {
    this.widgetTypeFormGroup.get('widget_type')?.valueChanges.subscribe((t) => {
      this.buildParametersForm(t as WidgetType);
    });
  }

  buildParametersForm(widgetType: WidgetType) {
    this.activeFields = widgetType ? this.widgetSchemas[widgetType] || [] : [];
    const group: Record<string, any> = {};

    for (const field of this.activeFields) {
      const fieldDefaultValue = field.defaultValue ?? '';
      group[field.key] = [this.data.widget ? (this.data.widget as any)[field.key] : fieldDefaultValue, field.validators || []];
    }

    this.widgetParametersFormGroup = this._formBuilder.group(group);
  }

  saveWidget() {
    const newWidget: any = {
      widget_type: this.widgetTypeFormGroup.get('widget_type')!.value,
    };
    for (const field of this.widgetSchemas[newWidget.widget_type]) {
      newWidget[field.key] = this.widgetParametersFormGroup.get(field.key)?.value;
    }
    if (this.data.widget) {
      newWidget['widget_id'] = this.data.widget.widget_id;
    }
    this.dialogRef.close(newWidget)
  }
}
