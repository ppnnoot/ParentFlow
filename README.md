# ParentFlow

A modern, interactive Organization Chart application built with Angular, Angular CDK, and Angular Material.

## Features

- **Interactive Drag & Drop**: Easily move nodes between levels or back to the available pool.
- **Dynamic Hierarchy**: Add unlimited levels. Children automatically group under their parents.
- **Smart Connectors**: 
  - Native SVG implementation.
  - Smooth "Rounded Corner" lines connecting parents to children.
  - Perfect synchronization with scrolling.
- **Edit Mode**:
  - **View-Only by default**: Prevents accidental changes.
  - **Edit Mode**: Unlocks Drag-and-Drop, "Add Level" (+), and "Delete Node" (Hover 'X') features.
- **Data Management**:
  - Functional State Management using Angular Signals (`org-chart.store.ts`).
  - Add new nodes with custom names (Thai, Chinese, Vietnamese support).
  - Recursive deletion (deleting a parent deletes all descendants) with confirmation dialog.

## Tech Stack

- **Framework**: Angular (Standalone Components)
- **UI Library**: Angular Material
- **Interactions**: Angular CDK (DragDrop)
- **Styling**: SCSS (Flexbox, Relative/Absolute positioning)
- **State**: Angular Signals

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Angular CLI

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

### Running the Application

```bash
ng serve
# Navigate to http://localhost:4200/
```

## Usage Guide

1.  **Viewing**: The chart opens in Read-Only mode. You can scroll and view the hierarchy.
2.  **Editing**: Click the **"Edit"** button at the bottom action bar.
2.  **Adding a Node**: 
    - Click the **Fab "+" Button** in the sidebar to create a new Position Node.
    - Drag it from the "Available Positions" list into Level 1 or onto a Parent in Level > 1.
3.  **Adding a Level**: Click the **"+"** button in the bottom action bar (Edit Mode only).
4.  **Connecting**:
    - **Level 1**: Drop anywhere in the Level 1 row.
    - **Level > 1**: Drop onto a target level. A generic grouping logic ensures it appears under the correct parent. *Note: Strict parent selection is handled during the drop event.*
5.  **Deleting**: Hover over a node card and click the **Red 'X'** button. Confirm the dialog.

## License

MIT
