# CropChop

A minimalistic image cropping tool built with React, Redux Toolkit, and TypeScript. This project demonstrates modern web development practices and was primarily developed using AI assistance through Cursor.

## Development Notes

This application was primarily developed using AI assistance through Cursor, demonstrating the potential of AI-augmented development workflows. The codebase follows functional programming principles and emphasizes clean, maintainable architecture.

**Development Time**: Approximately 2-3 hours from concept to completion, showcasing the efficiency of AI-assisted development.

**AI-Generated Assets**: The favicon and various UI elements were also created using AI assistance, maintaining consistency with the overall development approach.

## Demo

[Live Demo](https://vladyslav-dotsenko.github.io/crop-chop/)

## Highlights

- **[`AGENTS.md`](./AGENTS.md)** - Following the [agents.md standard initiative](https://github.com/agent-protocol/agents.md) for AI agent collaboration
- **[`favicon.svg`](./public/favicon.svg)** - AI generated svg file
- **[Real-time Canvas Rendering](./src/components/PreviewPanel/PreviewPanel.tsx)** - Some comprehansive canvas-rendering code AI helped me with (I would spend hours on this one myself)
- **[Frame Configuration Guide](./docs/frame-configuration.md)** - Comprehensive documentation for creating custom frame configurations

## Features

### Core Functionality
- **Image Upload**: Click to upload images in any standard format
- **Interactive Cropping**: Real-time image manipulation with mouse controls
- **Zoom & Pan**: Smooth zooming (mouse wheel) and panning (drag) with intelligent boundary constraints
- **Live Preview**: Real-time preview of the cropped result as you adjust the crop area
- **Custom Filename**: Editable filename with automatic size suffix (e.g., `image_300x200.png`)
- **Frame Templates**: Pre-built frame configurations (MTG cards, social media formats, etc.)
- **Custom Frames**: Create and configure custom frame templates with parameters
- **Export Options**: Export full frames or cropped images only

### Technical Features
- **Redux State Management**: Centralized state using Redux Toolkit with slice pattern
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Clean, minimalistic UI with pastel color scheme
- **Canvas Rendering**: High-quality image processing using HTML5 Canvas
- **Smart Constraints**: Prevents panning beyond image boundaries during zoom operations
- **Debounced Interactions**: Optimized wheel events for smooth performance

### Output
- **PNG/WebP Export**: High-quality image output in multiple formats
- **Multiple Sizes**: Export in original, large, and thumbnail sizes
- **Automatic Naming**: Smart filename generation with size information
- **One-Click Download**: Instant download of cropped images
- **Frame Export**: Export complete framed compositions or cropped images only

## Tech Stack

- **Frontend**: React 19, TypeScript
- **State Management**: Redux Toolkit, React-Redux
- **Build Tool**: Vite
- **Styling**: CSS3 with custom properties
- **Development**: ESLint, TypeScript ESLint

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## Documentation

- **[Frame Configuration Guide](./docs/frame-configuration.md)** - Learn how to create custom frame templates with parameters, layers, and export options
