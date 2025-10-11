# Frame Composer feature

## Given

We have an application that allows to choose a frame and then crop images with this frame.
Application works fully in-browser without sending your data or images anywhere.
Only local machine resources are used for processing.
All processing is made with in-browser JS code.

## User Story

As an application user, I want to crop some illustration and build an asset image of it with a configurable frame.

One of examples: craft an Magic The Gathering card:
- Choose MTG frame
- Upload illustration image
- Crop image with existing app functional
- In a sidebar, fill in additional parameters (e.g. card rarity, mana, card title, etc)
- Select desired image sizes from pre-configured options
- Edit file name
- Save image as png or webp format

As an advanced application user, I want to create a custom frame. This custom frame should be defined with a JSON input.
JSON input should allow me to define custom frame layers and parameters (e.g. card title, specific frame for different rarities, etc.)
