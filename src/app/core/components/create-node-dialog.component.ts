import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-create-node-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatSelectModule,
    MatRadioModule
  ],
  template: `
    <h2 mat-dialog-title>Create New Position</h2>
    <mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Position Name</mat-label>
          <input matInput formControlName="name">
          <mat-error *ngIf="form.get('name')?.hasError('required')">
            Name is required
          </mat-error>
        </mat-form-field>
        
        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Name (Thai)</mat-label>
          <input matInput formControlName="nameThai">
        </mat-form-field>

        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Name (Chinese)</mat-label>
          <input matInput formControlName="nameChinese">
        </mat-form-field>

        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Name (Vietnamese)</mat-label>
          <input matInput formControlName="nameVietnamese">
        </mat-form-field>

        <mat-form-field appearance="fill" style="width: 100%;">
          <mat-label>Section</mat-label>
          <mat-select formControlName="section">
            <mat-option value="Management">Management</mat-option>
            <mat-option value="Sales">Sales</mat-option>
            <mat-option value="Engineering">Engineering</mat-option>
            <mat-option value="HR">HR</mat-option>
            <mat-option value="Operations">Operations</mat-option>
          </mat-select>
        </mat-form-field>
        
        <div class="salary-type-group">
          <label id="salary-type-label">Salary Type</label>
          <mat-radio-group aria-labelledby="salary-type-label" formControlName="salaryType">
            <mat-radio-button value="Normal">Normal</mat-radio-button>
            <mat-radio-button value="Commission">Commission</mat-radio-button>
          </mat-radio-group>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="form.invalid">Create</button>
    </mat-dialog-actions>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
      padding-top: 10px;
    }
    .salary-type-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    mat-radio-group {
      display: flex;
      gap: 15px;
    }
  `]
})
export class CreateNodeDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateNodeDialogComponent>
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      nameThai: [''],
      nameChinese: [''],
      nameVietnamese: [''],
      section: [''],
      salaryType: ['Normal', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
