# Frame Configuration Guide

This guide explains how to define custom frame configurations for the CropChop application. Frames define the visual structure, parameters, and export options for image cropping.

## Table of Contents

- [Basic Frame Structure](#basic-frame-structure)
- [Frame Properties](#frame-properties)
- [Parameters](#parameters)
- [Layers](#layers)
- [Layer Types](#layer-types)
- [Layer Alignment](#layer-alignment)
- [Export Sizes](#export-sizes)
- [Complete Example](#complete-example)
- [Best Practices](#best-practices)

## Basic Frame Structure

A frame configuration is defined in `src/config/frames.ts` within the `frames` array:

```typescript
{
  id: 'unique-frame-id',
  title: 'Display Name',
  width: 488,
  height: 680,
  description: 'Frame description',
  parameters: [...],
  layers: [...],
  exportSizes: [...]
}
```

## Frame Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the frame |
| `title` | `string` | ✅ | Display name shown in frame selector |
| `width` | `number` | ✅ | Frame width in pixels |
| `height` | `number` | ✅ | Frame height in pixels |
| `description` | `string` | ✅ | Description shown in frame selector |
| `isCustom` | `boolean` | ❌ | Mark as custom frame (optional) |
| `parameters` | `FrameParameter[]` | ❌ | User-configurable parameters |
| `layers` | `FrameLayer[]` | ❌ | Visual layers that compose the frame |
| `exportSizes` | `ExportSize[]` | ❌ | Available export size options |

## Parameters

Parameters allow users to customize frame content through the UI. They appear as form controls in the Frame Parameters panel.

### Parameter Types

#### Text Parameter
```typescript
{
  id: 'cardTitle',
  name: 'cardTitle',
  type: 'text',
  label: 'Card Title',
  defaultValue: 'Lightning Bolt'
}
```

#### Number Parameter
```typescript
{
  id: 'fontSize',
  name: 'fontSize',
  type: 'number',
  label: 'Font Size',
  defaultValue: 16,
  min: 8,
  max: 72,
  step: 1
}
```

#### Select Parameter
```typescript
{
  id: 'rarity',
  name: 'rarity',
  type: 'select',
  label: 'Rarity',
  defaultValue: 'common',
  options: ['common', 'uncommon', 'rare', 'mythic']
}
```

#### Color Parameter
```typescript
{
  id: 'frameColor',
  name: 'frameColor',
  type: 'color',
  label: 'Frame Color',
  defaultValue: '#d4af37'
}
```

#### Boolean Parameter
```typescript
{
  id: 'showFlavor',
  name: 'showFlavor',
  type: 'boolean',
  label: 'Show Flavor Text',
  defaultValue: true
}
```

### Using Parameters in Layers

Parameters can be referenced in layer properties using `{{parameterId}}` syntax:

```typescript
{
  id: 'card-title',
  type: 'text',
  properties: {
    content: '{{cardTitle}}',  // Replaced with parameter value
    color: '{{frameColor}}'    // Replaced with parameter value
  }
}
```

## Layers

Layers define the visual elements that compose the frame. They are rendered in order based on their `zIndex` property.

### Layer Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | ✅ | Unique identifier for the layer |
| `type` | `LayerType` | ✅ | Layer type (see Layer Types) |
| `name` | `string` | ✅ | Display name for the layer |
| `visible` | `boolean` | ✅ | Whether the layer is visible |
| `zIndex` | `number` | ✅ | Rendering order (lower = behind) |
| `properties` | `object` | ✅ | Type-specific properties |

## Layer Types

### Background Layer
Creates a solid color rectangle.

```typescript
{
  id: 'background',
  type: 'background',
  name: 'Background',
  visible: true,
  zIndex: 0,
  properties: {
    backgroundColor: '#1a1a1a',
    x: 0,
    y: 0,
    width: 488,
    height: 680,
    borderRadius: 12
  }
}
```

**Properties:**
- `backgroundColor`: Color string (hex, rgb, etc.)
- `x`, `y`: Position coordinates
- `width`, `height`: Dimensions
- `borderRadius`: Corner radius (optional)

### Border Layer
Creates a border outline.

```typescript
{
  id: 'border',
  type: 'border',
  name: 'Frame Border',
  visible: true,
  zIndex: 1,
  properties: {
    borderColor: '{{frameColor}}',
    borderWidth: 4,
    x: 0,
    y: 0,
    width: 488,
    height: 680,
    borderRadius: 12
  }
}
```

**Properties:**
- `borderColor`: Border color
- `borderWidth`: Border thickness
- `x`, `y`: Position coordinates
- `width`, `height`: Dimensions
- `borderRadius`: Corner radius (optional)

### Text Layer
Renders text content.

```typescript
{
  id: 'card-title',
  type: 'text',
  name: 'Card Title',
  visible: true,
  zIndex: 3,
  properties: {
    content: '{{cardTitle}}',
    x: 20,
    y: 25,
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    textAlign: 'left'
  }
}
```

**Properties:**
- `content`: Text content (supports parameter substitution)
- `x`, `y`: Position coordinates
- `color`: Text color
- `fontSize`: Font size in pixels
- `fontFamily`: Font family
- `fontWeight`: Font weight ('normal', 'bold', etc.)
- `textAlign`: Text alignment ('left', 'center', 'right')
- `alignX`: Horizontal layer alignment ('left', 'center', 'right')
- `alignY`: Vertical layer alignment ('top', 'center', 'bottom')
- `marginX`: Horizontal margin from aligned edge (pixels)
- `marginY`: Vertical margin from aligned edge (pixels)

### Image Layer
Renders images or the cropped content.

```typescript
{
  id: 'art-area',
  type: 'image',
  name: 'Art Area',
  visible: true,
  zIndex: 1.5,
  properties: {
    imageUrl: '{{croppedImage}}',  // Special placeholder for cropped image
    x: 16,
    y: 60,
    width: 456,
    height: 328,
    borderRadius: 8,
    opacity: 1
  }
}
```

**Properties:**
- `imageUrl`: Image URL or `{{croppedImage}}` for the cropped image
- `x`, `y`: Position coordinates
- `width`, `height`: Dimensions
- `borderRadius`: Corner radius (optional)
- `opacity`: Transparency (0-1, optional)

**Special Image URLs:**
- `{{croppedImage}}`: The user's cropped image
- `{{parameterId}}`: Parameter substitution for dynamic images
- Regular URLs: Static images

### Shape Layer
Creates geometric shapes (future enhancement).

```typescript
{
  id: 'decoration',
  type: 'shape',
  name: 'Decoration',
  visible: true,
  zIndex: 2,
  properties: {
    shapeType: 'circle',
    x: 50,
    y: 50,
    width: 20,
    height: 20,
    fillColor: '#ff0000'
  }
}
```

## Layer Alignment

The alignment system provides flexible positioning for layers without requiring absolute coordinates. This makes frames more responsive and easier to maintain.

### Alignment Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `alignX` | `string` | `'left'`, `'center'`, `'right'` | Horizontal alignment within the frame |
| `alignY` | `string` | `'top'`, `'center'`, `'bottom'` | Vertical alignment within the frame |
| `marginX` | `number` | Any number | Horizontal margin from the aligned edge (pixels) |
| `marginY` | `number` | Any number | Vertical margin from the aligned edge (pixels) |

### Alignment vs Absolute Positioning

**Absolute Positioning (x, y):**
```typescript
properties: {
  x: 595,  // Fixed position from left edge
  y: 78,   // Fixed position from top edge
  content: '{{icons}}'
}
```

**Alignment-based Positioning:**
```typescript
properties: {
  alignX: 'right',    // Align to right edge
  alignY: 'top',      // Align to top edge
  marginX: 20,        // 20px margin from right edge
  marginY: 78,        // 78px margin from top edge
  content: '{{icons}}'
}
```

### Alignment Examples

**Right-aligned icons with margin:**
```typescript
{
  id: 'icons-area',
  type: 'text',
  properties: {
    alignX: 'right',
    alignY: 'top',
    marginX: 20,      // 20px from right edge
    marginY: 78,      // 78px from top edge
    content: '{{icons}}'
  }
}
```

**Center-aligned title:**
```typescript
{
  id: 'title',
  type: 'text',
  properties: {
    alignX: 'center',
    alignY: 'top',
    marginY: 50,      // 50px from top edge
    content: '{{title}}'
  }
}
```

**Bottom-right corner element:**
```typescript
{
  id: 'watermark',
  type: 'text',
  properties: {
    alignX: 'right',
    alignY: 'bottom',
    marginX: 10,      // 10px from right edge
    marginY: 10,      // 10px from bottom edge
    content: '© 2024'
  }
}
```

### Benefits of Alignment System

- **Responsive**: Layers automatically adjust to different frame sizes
- **Maintainable**: Easy to change positioning without calculating pixels
- **Flexible**: Supports both absolute and relative positioning
- **Consistent**: Same alignment system works across all layer types

### Mixing Absolute and Alignment Positioning

You can mix both approaches in the same frame:

```typescript
layers: [
  {
    id: 'background',
    properties: {
      x: 0,           // Absolute positioning
      y: 0,           // for full coverage
      width: 488,
      height: 680
    }
  },
  {
    id: 'title',
    properties: {
      alignX: 'center',  // Alignment positioning
      marginY: 50,       // for responsive layout
      content: '{{title}}'
    }
  }
]
```

## Export Sizes

Define multiple export size options for users.

```typescript
exportSizes: [
  { name: 'original', width: 488, height: 680, scale: 1 },
  { name: 'large', width: 976, height: 1360, scale: 2 },
  { name: 'thumbnail', width: 244, height: 340, scale: 0.5 }
]
```

**Properties:**
- `name`: Display name for the size option
- `width`: Export width in pixels
- `height`: Export height in pixels
- `scale`: Scale factor relative to original

## Complete Example

Here's a complete MTG-style creature card frame:

```typescript
{
  id: 'mtg-creature',
  title: 'MTG Creature Card',
  width: 488,
  height: 680,
  description: 'Creature frame with art, rules box and P/T',
  parameters: [
    {
      id: 'cardTitle',
      name: 'cardTitle',
      type: 'text',
      label: 'Card Title',
      defaultValue: 'Savannah Lions'
    },
    {
      id: 'manaCost',
      name: 'manaCost',
      type: 'text',
      label: 'Mana Cost',
      defaultValue: '{W}'
    },
    {
      id: 'rarity',
      name: 'rarity',
      type: 'select',
      label: 'Rarity',
      defaultValue: 'common',
      options: ['common', 'uncommon', 'rare', 'mythic']
    },
    {
      id: 'cardType',
      name: 'cardType',
      type: 'text',
      label: 'Type Line',
      defaultValue: 'Creature — Cat'
    },
    {
      id: 'rulesText',
      name: 'rulesText',
      type: 'text',
      label: 'Rules Text',
      defaultValue: 'First strike'
    },
    {
      id: 'powerToughness',
      name: 'powerToughness',
      type: 'text',
      label: 'Power/Toughness',
      defaultValue: '2/1'
    }
  ],
  layers: [
    {
      id: 'background',
      type: 'background',
      name: 'Background',
      visible: true,
      zIndex: 0,
      properties: {
        backgroundColor: '#1a1a1a',
        borderRadius: 12
      }
    },
    {
      id: 'border',
      type: 'border',
      name: 'Frame Border',
      visible: true,
      zIndex: 1,
      properties: {
        borderColor: '#cccccc',
        borderWidth: 4,
        borderRadius: 12
      }
    },
    {
      id: 'rarity-overlay',
      type: 'image',
      name: 'Rarity Overlay',
      visible: true,
      zIndex: 1.6,
      properties: {
        x: 16,
        y: 60,
        width: 456,
        height: 328,
        imageUrl: '/assets/mtg/rarity/{{rarity}}.png',
        opacity: 0.25,
        borderRadius: 8
      }
    },
    {
      id: 'art-area',
      type: 'image',
      name: 'Art Area',
      visible: true,
      zIndex: 1.5,
      properties: {
        x: 16,
        y: 60,
        width: 456,
        height: 328,
        imageUrl: '{{croppedImage}}',
        borderRadius: 8
      }
    },
    {
      id: 'title-area',
      type: 'background',
      name: 'Title Area',
      visible: true,
      zIndex: 2,
      properties: {
        backgroundColor: '#2a2a2a',
        x: 8,
        y: 8,
        width: 472,
        height: 40,
        borderRadius: 8
      }
    },
    {
      id: 'mana-cost',
      type: 'text',
      name: 'Mana Cost',
      visible: true,
      zIndex: 3,
      properties: {
        x: 420,
        y: 25,
        color: '#ffff00',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textAlign: 'right',
        content: '{{manaCost}}'
      }
    },
    {
      id: 'card-title',
      type: 'text',
      name: 'Card Title',
      visible: true,
      zIndex: 3,
      properties: {
        x: 20,
        y: 25,
        color: '#ffffff',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textAlign: 'left',
        content: '{{cardTitle}}'
      }
    },
    {
      id: 'type-line',
      type: 'background',
      name: 'Type Line',
      visible: true,
      zIndex: 2,
      properties: {
        backgroundColor: '#333333',
        x: 8,
        y: 400,
        width: 472,
        height: 28,
        borderRadius: 6
      }
    },
    {
      id: 'type-text',
      type: 'text',
      name: 'Type Text',
      visible: true,
      zIndex: 3,
      properties: {
        x: 20,
        y: 418,
        color: '#ffffff',
        fontSize: 13,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        content: '{{cardType}}'
      }
    },
    {
      id: 'rules-box',
      type: 'background',
      name: 'Rules Box',
      visible: true,
      zIndex: 2,
      properties: {
        backgroundColor: '#2a2a2a',
        x: 8,
        y: 430,
        width: 472,
        height: 150,
        borderRadius: 8
      }
    },
    {
      id: 'rules-text',
      type: 'text',
      name: 'Rules Text',
      visible: true,
      zIndex: 3,
      properties: {
        x: 20,
        y: 450,
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        textAlign: 'left',
        content: '{{rulesText}}'
      }
    },
    {
      id: 'pt-box',
      type: 'background',
      name: 'P/T Box',
      visible: true,
      zIndex: 2,
      properties: {
        backgroundColor: '#333333',
        x: 408,
        y: 602,
        width: 72,
        height: 40,
        borderRadius: 6
      }
    },
    {
      id: 'pt-text',
      type: 'text',
      name: 'P/T',
      visible: true,
      zIndex: 3,
      properties: {
        x: 444,
        y: 630,
        color: '#ffffff',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
        content: '{{powerToughness}}'
      }
    }
  ],
  exportSizes: [
    { name: 'original', width: 488, height: 680, scale: 1 },
    { name: 'large', width: 976, height: 1360, scale: 2 },
    { name: 'thumbnail', width: 244, height: 340, scale: 0.5 }
  ]
}
```

## Size Visualization

The application automatically visualizes the relationship between frame size and cropped image size:

### Frame Selection Preview
- **Frame outline**: Shows the full frame dimensions
- **Cropped area overlay**: Green highlighted area showing the actual crop dimensions
- **Size indicators**: Displays both frame and crop dimensions with aspect ratios

### Preview Panel
- **Frame size**: Total frame dimensions (e.g., 488 × 680px)
- **Crop size**: Actual cropped image dimensions (e.g., 456 × 328px)
- **Scale**: Current zoom level of the image

### Visual Indicators
- **Green border**: Full frame outline
- **Green overlay**: Cropped image area within the frame
- **Size labels**: Clear distinction between "Frame" and "Crop" dimensions

This helps users understand:
- How much of the frame is used for the actual image
- The relationship between frame decorations and image content
- Export dimensions for both full frame and cropped-only exports

## Best Practices

### Layer Organization
1. **Background layers**: Use zIndex 0-1
2. **Content layers**: Use zIndex 1.5-2
3. **Text layers**: Use zIndex 3+
4. **Overlays**: Use fractional zIndex (1.6, 1.7) for fine control

### Positioning Strategy
1. **Use alignment for responsive elements**: Icons, titles, watermarks
2. **Use absolute positioning for fixed elements**: Backgrounds, borders, art areas
3. **Prefer alignment over absolute positioning** when possible
4. **Test with different frame sizes** to ensure alignment works correctly

### Parameter Naming
- Use camelCase for parameter IDs
- Make parameter IDs descriptive
- Use consistent naming across similar parameters

### Image Assets
- Place static images in `public/assets/`
- Use parameter substitution for dynamic images
- Always provide fallback values for parameters

### Performance
- Keep layer count reasonable (< 20 layers)
- Use opacity sparingly for performance
- Optimize image assets for web delivery

### Testing
- Test with different parameter values
- Verify export sizes work correctly
- Check layer visibility toggles
- Test parameter substitution

## Troubleshooting

### Common Issues

**Layer not appearing:**
- Check `visible: true`
- Verify zIndex is appropriate
- Ensure coordinates are within frame bounds

**Parameter not updating:**
- Verify parameter ID matches `{{parameterId}}` syntax
- Check parameter is defined in parameters array
- Ensure parameter has a default value

**Image not loading:**
- Verify image URL is correct
- Check image is in `public/` directory
- Ensure parameter substitution is working

**Export issues:**
- Verify exportSizes are defined
- Check frame dimensions are reasonable
- Ensure all required layers are visible

For more help, check the existing frame configurations in `src/config/frames.ts` or refer to the application's source code.
