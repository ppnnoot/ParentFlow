import { Component, inject, AfterViewInit, OnDestroy, ElementRef, NgZone, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PositionNode } from './core/models/position.model';
import { ParentSelectionDialogComponent } from './core/components/parent-selection-dialog.component';
import { CreateNodeDialogComponent } from './core/components/create-node-dialog.component';
import { ConfirmDialogComponent } from './core/components/confirm-dialog.component';
import * as OrgChartStore from './core/store/org-chart.store'; // Import Store

// Use require or import depending on the library structure. 
// leader-line-new often requires a specific import or global access.
// We'll try a direct import with type suppression if needed, or better, use a declaration.


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    CdkDropList, 
    CdkDrag, 
    CdkDropListGroup, 
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'ParentFlow';
  private ngZone = inject(NgZone);
  private dialog = inject(MatDialog);

  // Local UI State
  isEditMode = signal(false);

  // Expose signals for the template from Store directly
  nodes = OrgChartStore.nodes;
  nodesByLevel = OrgChartStore.nodesByLevel;
  childrenByParent = OrgChartStore.childrenByParent;

  // Levels to display in the main chart (e.g., Level 1 to Level 5)
  levels = signal([0, 1, 2, 3]); 

  // SVG Connectors
  connectors = signal<{ d: string }[]>([]);

  toggleEditMode(): void {
      this.isEditMode.update(v => !v);
  }

  addLevel(): void {
      this.levels.update(current => [...current, current.length]);
  }

  onSave(): void {
      this.isEditMode.set(false);
      // Logic to save to backend would go here
  }

  @ViewChild('mainChart', { static: true }) mainChart!: ElementRef<HTMLDivElement>;
  @ViewChild('levelsContainer', { static: true }) levelsContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
      // Draw lines initially after view is stable
      setTimeout(() => this.calculateConnectors(), 100);
      
      // Update lines on window resize
      window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
      window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
      this.calculateConnectors();
  }

  openCreateDialog(): void {
      const dialogRef = this.dialog.open(CreateNodeDialogComponent, {
          width: '400px'
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result) {
              OrgChartStore.addNode({
                  ...result,
                  id: this.generateId()
              });
              // No need to manually refresh lines immediately, signals will trigger updates, 
              // but we need to wait for DOM.
              setTimeout(() => this.calculateConnectors(), 50);
          }
      });
  }

  deleteNode(node: PositionNode): void {
      // 1. Calculate how many children will be deleted
      const descendants = OrgChartStore.getDescendants(node.id);
      const count = descendants.length;
      
      let message = `Are you sure you want to delete '${node.name}'?`;
      if (count > 0) {
          message += ` This will also delete ${count} sub-items below it.`;
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { 
          title: 'Confirm Deletion', 
          message: message 
        },
        width: '400px'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          OrgChartStore.removeNode(node.id);
          this.refreshLines();
        }
      });
  }
  
  generateId(): string {
      return Math.random().toString(36).substr(2, 9);
  }

  drop(event: CdkDragDrop<PositionNode[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.refreshLines(); // Just in case
    } else {
      const node = event.item.data as PositionNode;
      const targetLevelIndex = parseInt(event.container.id.replace('level-', ''), 10);
      
      if (!isNaN(targetLevelIndex)) {
         // Logic for dropping into a level
         if (targetLevelIndex === 0) {
             // Level 1: No parent
             OrgChartStore.moveNode(node.id, 0, null);
             this.refreshLines();
         } else {
             // Level > 1: Must select parent from Level N-1
             const potentialParents = this.getNodesForLevel(targetLevelIndex - 1);
             
             if (potentialParents.length === 0) {
                 alert('No parent available in the previous level!');
                 // Since we didn't move the node in service, it will visually snap back 
                 // because the source of truth (signals) hasn't changed.
                 return;
             }
             
             // Open Dialog
             const dialogRef = this.dialog.open(ParentSelectionDialogComponent, {
                 data: { nodes: potentialParents },
                 width: '400px'
             });
             
             dialogRef.afterClosed().subscribe(parentId => {
                 if (parentId) {
                     OrgChartStore.moveNode(node.id, targetLevelIndex, parentId);
                     this.refreshLines();
                 }
                 // If cancelled, do nothing. Node stays in original position.
             });
         }
      } else if (event.container.id === 'available-list') {
           // Moving back to available
           OrgChartStore.moveNode(node.id, -1, null);
           this.refreshLines();
      }
    }
  }
  
  refreshLines() {
      // Wait for DOM update then redraw
      setTimeout(() => {
          this.calculateConnectors();
      }, 50);
  }

  calculateConnectors() {
      if (!this.levelsContainer) return;
      
      const newConnectors: { d: string }[] = [];
      const nodes = this.nodes();
      
      // We calculate relative to the container that holds the SVG
      const containerRect = this.levelsContainer.nativeElement.getBoundingClientRect();

      nodes.forEach(node => {
          if (node.parentId) {
              const parentEl = document.getElementById(`node-${node.parentId}`);
              const childEl = document.getElementById(`node-${node.id}`);

              if (parentEl && childEl) {
                  const parentRect = parentEl.getBoundingClientRect();
                  const childRect = childEl.getBoundingClientRect();

                  // Calculate centers relative to the levels-container
                  // No scroll math needed because both rects are viewport-relative
                  // and their difference is the offset within the container (plus container scroll but SVG scrolls with it)
                  const pX = (parentRect.left - containerRect.left) + (parentRect.width / 2);
                  const pY = (parentRect.top - containerRect.top) + parentRect.height; // Start bottom of parent usually
                  
                  const cX = (childRect.left - containerRect.left) + (childRect.width / 2);
                  const cY = (childRect.top - containerRect.top);

                  // "Squared" Path Logic
                  // (Previous logic removed)

                  // Rounded Corner Path Logic
                  const radius = 20;
                  const dy = cY - pY;
                  const dx = cX - pX;
                  
                  // If nodes are very close horizontally, just draw a straight(ish) line
                  if (Math.abs(dx) < 2) {
                       const d = `M ${pX} ${pY} L ${cX} ${cY}`;
                       newConnectors.push({ d });
                       return;
                  }

                  const midY = pY + dy / 2;
                  
                  // Ensure radius isn't too big for the space
                  const r = Math.min(radius, Math.abs(dx) / 2, Math.abs(midY - pY));
                  
                  // Direction multiplier
                  const mx = dx > 0 ? 1 : -1;

                  // M: Start
                  // L: Down to first turn start
                  // Q: Curve 1 (Control: Corner1 -> End: start of horiz)
                  // L: Horizontal to second turn start
                  // Q: Curve 2 (Control: Corner2 -> End: start of vert)
                  // L: End
                  const d = `
                      M ${pX} ${pY}
                      L ${pX} ${midY - r}
                      Q ${pX} ${midY} ${pX + r * mx} ${midY}
                      L ${cX - r * mx} ${midY}
                      Q ${cX} ${midY} ${cX} ${midY + r}
                      L ${cX} ${cY}
                  `;
                  
                  newConnectors.push({ d });
              }
          }
      });

      this.connectors.set(newConnectors);
  }
  
  // Helper to get nodes for a specific level
  getNodesForLevel(levelIndex: number): PositionNode[] {
      return this.nodesByLevel()[levelIndex] || [];
  }
  
  get availableNodes(): PositionNode[] {
      return this.nodes().filter(n => n.levelIndex < 0);
  }

  getParentName(node: PositionNode): string {
      if (!node.parentId) return 'No Parent';
      const parent = this.nodes().find(n => n.id === node.parentId);
      return parent ? parent.name : 'Unknown Parent';
  }
}
