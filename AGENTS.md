# agents.md

## General
- announce if you've aligned your work with this file after each agent request

## Architecture
- use Redux as main local data storage
- prefer redux-toolkit and slice pattern for data layer before anything else
- for more complex logic use redux middleware
- decompose a logic into a separate component were applicable
- define a pure components (those that are not connected to redux and are fully parametrised) as a separate folder

## Codestyle
- when working with folders always create an index.ts as a facade file
- do not use semicolons
- usin single-quotes
- indent with 2 spaces

## Design Preferences
- prefer minimalistic, clean designs over complex ones
- favor coding-hipster aesthetic (green-on-black terminal style, geometric precision)
- keep favicons and icons simple and uncluttered
