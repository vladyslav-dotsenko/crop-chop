import type { FrameConfig } from '../types'

const frameConfig: FrameConfig = {
  frames: [
    {
      id: 'l-square',
      title: 'Large Square',
      width: 720,
      height: 720,
      description: 'Large square card',
      exportSizes: [
        { name: 'original', width: 720, height: 720, scale: 1 },
        { name: 'large', width: 1440, height: 1440, scale: 2 },
        { name: 'thumbnail', width: 360, height: 360, scale: 0.5 }
      ]
    },
    {
      id: 'm-square',
      title: 'Mid Square',
      width: 400,
      height: 400,
      description: 'Medium square card',
      exportSizes: [
        { name: 'original', width: 400, height: 400, scale: 1 },
        { name: 'large', width: 800, height: 800, scale: 2 },
        { name: 'thumbnail', width: 200, height: 200, scale: 0.5 }
      ]
    },
    {
      id: 'twitter-header',
      title: 'Twitter Header',
      width: 1500,
      height: 500,
      description: 'Twitter profile header',
      exportSizes: [
        { name: 'original', width: 1500, height: 500, scale: 1 },
        { name: 'large', width: 3000, height: 1000, scale: 2 },
        { name: 'thumbnail', width: 750, height: 250, scale: 0.5 }
      ]
    },
    {
      id: 'youtube-thumbnail',
      title: 'YouTube Thumbnail',
      width: 1280,
      height: 720,
      description: 'YouTube video thumbnail',
      exportSizes: [
        { name: 'original', width: 1280, height: 720, scale: 1 },
        { name: 'large', width: 2560, height: 1440, scale: 2 },
        { name: 'thumbnail', width: 640, height: 360, scale: 0.5 }
      ]
    },
    {
      id: 'ravn-card',
      title: 'Ravn Card',
      width: 696,
      height: 1080,
      description: 'A person card with configurable frame from ravn.co',
      parameters: [
        {
          id: 'cardTitle',
          name: 'cardTitle',
          type: 'text',
          label: 'Title',
          defaultValue: 'John Doe'
        },
        {
          id: 'backgroundColor',
          name: 'backgroundColor',
          type: 'select',
          label: 'Background Color',
          defaultValue: 'lightBlue',
          options: [
            { value: 'lightBlue', label: 'Light Blue (#80D8D8)' },
            { value: 'darkBlue', label: 'Dark Blue (#204080)' },
            { value: 'yellowGold', label: 'Yellow Gold (#F0D060)' },
            { value: 'gradient', label: 'Gradient (Pink to Purple)' },
            { value: 'custom', label: 'Custom Color' }
          ]
        },
        {
          id: 'customBackgroundColor',
          name: 'customBackgroundColor',
          type: 'color',
          label: 'Custom Background Color',
          defaultValue: '#d4af37',
          condition: 'backgroundColor === "custom"'
        },
        {
          id: 'icons',
          name: 'icons',
          type: 'text',
          label: 'Icons (FA classes)',
          defaultValue: 'fa-github fa-twitter fa-linkedin'
        },
        {
          id: 'contentTitle1',
          name: 'contentTitle1',
          type: 'text',
          label: 'Content Title 1',
          defaultValue: 'Title 1'
        },
        {
          id: 'contentParagraph1',
          name: 'contentParagraph1',
          type: 'text',
          label: 'Content Paragraph 1',
          defaultValue: 'Add a short description here - Add a short description here'
        },
        {
          id: 'contentTitle2',
          name: 'contentTitle2',
          type: 'text',
          label: 'Content Title 2',
          defaultValue: 'Title 2'
        },
        {
          id: 'contentParagraph2',
          name: 'contentParagraph2',
          type: 'text',
          label: 'Content Paragraph 2',
          defaultValue: 'Add a short description here - Add a short description here'
        },
      ],
      layers: [
        {
          id: 'background',
          type: 'background',
          name: 'Background',
          visible: true,
          zIndex: 0,
          properties: {
            backgroundColor: '{{backgroundColor}}',
            customBackgroundColor: '{{customBackgroundColor}}',
            borderRadius: 40
          }
        },
        {
          id: 'border',
          type: 'border',
          name: 'Frame Border',
          visible: true,
          zIndex: 1,
          properties: {
            borderColor: '#000000',
            borderWidth: 8,
            borderRadius: 40
          }
        },
        {
          id: 'art-area',
          type: 'image',
          name: 'Art Area',
          visible: true,
          zIndex: 1.5,
          properties: {
            x: 80,
            y: 80,
            width: 536,
            height: 920,
            imageUrl: '{{croppedImage}}',
            borderRadius: 20,
            borderColor: '#000000',
            borderWidth: 8,
          }
        },
        {
          id: 'art-area-border',
          type: 'border',
          name: 'Art Area Border',
          visible: true,
          zIndex: 1.6,
          properties: {
            x: 80,
            y: 80,
            width: 536,
            height: 920,
            borderColor: '#000000',
            borderWidth: 8,
            borderRadius: 20
          }
        },
        {
          id: 'title-area',
          type: 'image',
          name: 'Title Area',
          visible: true,
          zIndex: 2,
          properties: {
            x: 28,
            y: 46,
            width: 624 + 16,
            height: 88 + 16,
            imageUrl: '/assets/ravn-community/card-title.png',
          }
        },
        {
          id: 'card-title',
          type: 'text',
          name: 'Card Title',
          visible: true,
          zIndex: 3,
          properties: {
            alignX: 'left',
            alignY: 'top',
            marginX: 60,
            marginY: 78,
            color: '#000000',
            fontSize: 32,
            fontFamily: 'Roboto, sans-serif',
            textAlign: 'left',
            maxWidth: 400, // Reasonable max width for title
            content: '{{cardTitle}}'
          }
        },
        {
          id: 'icons-area',
          type: 'text',
          name: 'Icons Area',
          visible: true,
          zIndex: 4,
          properties: {
            alignX: 'right',
            alignY: 'top',
            marginX: 60,
            marginY: 78,
            color: '#000000',
            fontSize: 28,
            fontFamily: 'Font Awesome 6 Free',
            fontWeight: '900',
            textAlign: 'right',
            content: '{{icons}}'
          }
        },
        {
          id: 'content-area',
          type: 'image',
          name: 'Content Area',
          visible: true,
          zIndex: 5,
          properties: {
            alignX: 'left',
            alignY: 'top',
            marginX: 22,
            marginY: 585,
            width: 624 + 24,
            height: 314 + 24,
            imageUrl: '/assets/ravn-community/card-content.png',
          }
        },
        {
          id: 'text-content-title-1',
          type: 'text',
          name: 'Content Title 1',
          visible: true,
          zIndex: 7,
          properties: {
            x: 60,
            y: 640,
            color: '#8B5CF6', // Purple color like in the design
            fontSize: 20,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '600',
            textAlign: 'left',
            content: '◆ {{contentTitle1}}' // Add diamond icon
          }
        },
        {
          id: 'text-content-paragraph-1',
          type: 'text',
          name: 'Content Paragraph 1',
          visible: true,
          zIndex: 8,
          properties: {
            x: 60,
            y: 640 + 35,
            color: '#333333',
            fontSize: 26,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '400',
            textAlign: 'left',
            maxWidth: 568, // 608 - 40 margins
            content: '{{contentParagraph1}}'
          }
        },
        {
          id: 'text-content-title-2',
          type: 'text',
          name: 'Content Title 2',
          visible: true,
          zIndex: 10,
          properties: {
            x: 60,
            y: 770,
            color: '#8B5CF6', // Purple color like in the design
            fontSize: 20,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '600',
            textAlign: 'left',
            content: '◆ {{contentTitle2}}' // Add diamond icon
          }
        },
        {
          id: 'text-content-paragraph-2',
          type: 'text',
          name: 'Content Paragraph 2',
          visible: true,
          zIndex: 11,
          properties: {
            x: 60,
            y: 770 + 35,
            color: '#333333',
            fontSize: 26,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: '400',
            textAlign: 'left',
            maxWidth: 568, // 608 - 40 margins
            content: '{{contentParagraph2}}'
          }
        },
      ],
      exportSizes: [
        { name: 'original', width: 488, height: 680, scale: 1 },
        { name: 'large', width: 976, height: 1360, scale: 2 },
        { name: 'thumbnail', width: 244, height: 340, scale: 0.5 }
      ]
    }
  ]
}

export default frameConfig
