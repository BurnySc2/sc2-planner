# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this application will calculate at the time those actions can be executed.

# Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner)

## Examples

[Reaper expand into reactored hellions example](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=tLuDriteRdVrisSritDsbtGrisEritkuBtgxNEtnfibViriuFsExfptlggcuBsctVgfkxnKtjkilTkli2MyMrxfesatRiiRTbjyo9ritCVWZe2TuByJ9risLuArgslyKDrgtXRzVL4jtkZfezSttR2a2SxiJtleZkxgMsntiS2RtRcsbtfddReUz4fxmHsbtVekyXMxsW3YtcrgtUfne5PtFskd0L7tDlggcuBsctVgf5Cy2e51tWZe3AuBxnfsltRixnD1fazWfse0LD2VyogyIfsLuA6jzLDrgtXRj1ncsa4xti2Wtbj5jy4Fy39xfgsntiS6UtRcsbtfddReUyug2qtig3GtkzY9risktZWkrg0tIrgtWi4Brg0zR1hSsexiFuBrg2FxzDtVVxzkzOfsb6DtcrgtUfnergsltFskdyMcsgtV2qxTExjJtleZ6RxhszRfxf9zl5tN)

# Building it yourself

## Requirements

[Node](https://nodejs.org/en/download/) is required to create this static website.

## Setup

Install packages:

`npm install`

## Deploy

To test:

`npm test`

To start dev server:

`npm start`

To deploy in `/build` directory:

`npm run build`

# Copyright

Most image assets are owned by Blizzard and are used according to http://blizzard.com/company/about/legal-faq.html.

©Blizzard Entertainment, Inc. All rights reserved. Wings of Liberty, Heart of the Swarm, Legacy of the Void, StarCraft, Brood War, Battle.net, and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.

# Other

Prettify all .ts files:

`prettier --write "**/*.ts"`

# TODO

Tasks that still need to be done, also see the [issues page](https://github.com/BurnySc2/sc2-planner/issues):

-   Overhaul income function - it does not seem to be accurate
-   Change Website icon
-   Improve GUI looks
-   Add SALT encoding and decoding
-   Grey out actions / icons that are currently not available (locked by techtree)
