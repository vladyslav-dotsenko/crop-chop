# Font Awesome Icons Guide

## Overview

The app supports Font Awesome icons in text layers. Icons can be rendered by specifying Font Awesome class names, which are automatically converted to Unicode characters for canvas rendering.

## How to Use

### 1. Configure a Text Layer with Font Awesome

In your frame configuration, set the `fontFamily` property to `'Font Awesome 6 Free'`:

```typescript
{
  id: 'icons-area',
  type: 'text',
  name: 'Icons Area',
  visible: true,
  zIndex: 4,
  properties: {
    x: 595,
    y: 78,
    color: '#000000',
    fontSize: 28,
    fontFamily: 'Font Awesome 6 Free',
    fontWeight: '900',  // Required for solid icons
    textAlign: 'right',
    content: '{{icons}}'
  }
}
```

### 2. Add an Icons Parameter

Add a parameter to accept Font Awesome class names:

```typescript
{
  id: 'icons',
  name: 'icons',
  type: 'text',
  label: 'Icons (FA classes)',
  defaultValue: 'fa-github fa-twitter fa-linkedin'
}
```

### 3. Icon Format

Users can enter Font Awesome class names separated by spaces:
- `fa-github fa-twitter fa-linkedin`
- `fa-heart fa-star fa-bookmark`
- `github twitter linkedin` (the `fa-` prefix is optional)

## Supported Icons

The app includes a mapping of common Font Awesome icons:

### Social Media
- github, twitter, x-twitter, linkedin, facebook, instagram, youtube, discord, twitch, reddit, telegram, whatsapp, tiktok, snapchat, pinterest

### Professional
- envelope, globe, link, briefcase, graduation-cap, building, phone, mobile

### Common UI
- user, users, heart, star, bookmark, comment, share, trophy, award, medal, crown

### Arrows
- arrow-right, arrow-left, arrow-up, arrow-down, chevron-right, chevron-left, chevron-up, chevron-down

### Actions
- download, upload, check, times, plus, minus, search, edit, trash, save

### Other
- home, cog, bell, calendar, clock, location-dot, camera, image, video, music, file, folder, shopping-cart, gift, code, terminal, fire, bolt, rocket, palette, paint-brush, hammer, wrench, sun, moon

## Technical Details

- Font Awesome is loaded via CDN in `index.html`
- Icon class names are converted to Unicode characters in `src/utils/fontAwesomeIcons.ts`
- Conversion happens automatically when rendering text layers with Font Awesome font family
- Font weight `900` is required for solid icons (default Font Awesome 6 Free style)

## Adding More Icons

To add more icons, update the `fontAwesomeIcons` mapping in `src/utils/fontAwesomeIcons.ts`:

```typescript
export const fontAwesomeIcons: Record<string, string> = {
  // ... existing icons
  'your-icon-name': '\ufXXX',  // Unicode character for the icon
}
```

Find icon Unicode values in the [Font Awesome documentation](https://fontawesome.com/icons).

