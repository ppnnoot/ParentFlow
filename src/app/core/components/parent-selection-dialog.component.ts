import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { PositionNode } from '../models/position.model';

@Component({
  selector: 'app-parent-selection-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatListModule],
  template: `
    <h2 mat-dialog-title>Select Parent Node</h2>
    <mat-dialog-content>
      <p>Please select a parent from the level above:</p>
      <mat-list>
        <mat-list-item *ngFor="let node of data.nodes">
          <span matListItemTitle>
             <button mat-button (click)="selectParent(node)" style="width: 100%; text-align: left;">
              {{ node.name }} ({{ node.salaryType }})
            </button>
          </span>
        </mat-list-item>
      </mat-list>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    }
  `]
})
export class ParentSelectionDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ParentSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nodes: PositionNode[] }
  ) {}

  selectParent(node: PositionNode): void {
    this.dialogRef.close(node.id);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
