# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this web-application will simulate/calculate the time at which those actions can be executed.

# Live Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner)

# Tutorial Video
[![Watch the video](https://img.youtube.com/vi/3OcqNGoAdBs/hqdefault.jpg)](https://www.youtube.com/embed/3OcqNGoAdBs)

[<img src="https://img.youtube.com/vi/3OcqNGoAdBs/hqdefault.jpg" width="600" height="300"
/>](https://www.youtube.com/embed/3OcqNGoAdBs)

## Examples

### Terran

[Reaper expand into reactored hellions](https://burnysc2.github.io/sc2-planner/?race=terran&bo=002eJyLrlbKTFGyMjHVUSqpLEhVslIqzy%2FKTi1SqtUhX8bQEi5TXFJUmlxSWpRKkYFGhmQZaGRAnja4RGJySWZ+HjE+NjbCZxUiPErzMkuIMM8clxMMLcjyEpkxYmSOR5sxeU4hK0GZ4QwPnJGFOwjxxxVOR5gaY49FDPFYAOnUDYE%3D)

### Protoss

[Gateway expand into 1 gas 7 gate chargelot allin](https://burnysc2.github.io/sc2-planner/?race=protoss&bo=002eJyLrlbKTFGysjDRUSqpLEhVslIqzy%2FKTi1SqtUhJGNkCJdJTC7JzM8jQg9uGTMDuExxSVFpcklpUSplBhpR2UDq+tfUkiznmZPnK7yha2ZIt5AyomYQ0isSzUypHD40S2OlBelFiSlEJQh86WjQSZobI7yYl1mC8J8ZTq8b4ApI0iWMTXHJ4HIXqeL4s+dgkyTVd7QPv1HxYSoeCwDC0LNx)

### Zerg

[13 Hatch with extractor trick](https://burnysc2.github.io/sc2-planner/?race=zerg&bo=002eJyLrlbKTFGyMjQw0VEqqSxIVbJSKs8vyk4tUqrVoZGUhQVcprikqDS5pLQolRh9xsZwmcTkksz8PISJZnhMpL51hgYI+0rzMktoGFSW5LmdXCl6+cvQCJdNOCXomEDpF0TGhrjSGG4ZEm2KBQDM0DNF)

## Hotkeys

With the arrow keys (left and right) you can navigate through the build order. Holding `shift` will jump by 5, and holding `ctrl` will jump to the start with left arrow or to the end with right arrow.

# Development - Building it yourself

## Requirements

[Node 24 or newer](https://nodejs.org/en/download/) is required to create this static website.

## Setup

```
npm install
```

## Deploy

### Test

`npm run test`

### End-to-end test

`npm run teste2e`

### Develop
To start dev server:

`npm start`

Then go to [localhost:3000](http://localhost:3000)

### Build and deploy
To deploy in `/build` directory:

`npm run build`

## Update

To update to the current patch, a freshly generated `data.json` from [SC2 Techtree](https://github.com/BurnySc2/sc2-techtree) is required and needs to be placed in `src/constants/data.json`. If a new unit, structure or upgrade was introduced, then its icon needs to be placed in the `src/icons/png` directory. Console asserts might be printed in the browser console if the number of units or upgrades changed in a patch.

# Copyright

Most image assets are owned by Blizzard and are used according to http://blizzard.com/company/about/legal-faq.html.

©Blizzard Entertainment, Inc. All rights reserved. Wings of Liberty, Heart of the Swarm, Legacy of the Void, StarCraft, Brood War, Battle.net, and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.

# Other

Prettify all .ts and .tsx files:

`npm run lint:fix`

# TODO

Tasks that still need to be done, also see the [issues page](https://github.com/BurnySc2/sc2-planner/issues):

-   Improve GUI looks
-   Add SALT encoding and decoding
-   Grey out actions / icons that are currently not available (locked by techtree)
-   Sort zerg townhalls by how much larva it has (build units from hatchery first which has the most free larva)
-   Sort terran production structures by: `has reactor`, `has no addon`, `has techlab` when trying to queue new units that do not require a techlab.
