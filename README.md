# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this application will calculate at the time those actions can be executed.

# Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=tLuDriteRdVrisSritDsbtGrisEritkuBtgxNEtnfibViriuFsExfptlggcuBsctVgfkxnKtjkilTkli2MyMrxfesatRiiRTbjyo9ritCVWZe2TuByJ9risLuArgslyKDrgtXRzVL4jtkZfezSttR2a2SxiJtleZkxgMsntiS2RtRcsbtfddReUz4fxmHsbtVekyXMxsW3YtcrgtUfne5PtFskd0L7tDlggcuBsctVgf5Cy2esltRiZe2J01ZysfsezhD2VuByofyIfsa4Kti3LtbjCVyRFyQ9xfgsntiS5qtRcsbtfddReUyu9risktZWkrg0GIrgtWi3Xrg0MRxPDtZfex2MsexiFuBrg2FxzDtVVxzkzOfsb5ZtcrgtUfnergsltFskdyMcsgtV2qxTExjJtle6axhtzRfxfVtN)

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

Tasks that still need to be done, also see [issues page](https://github.com/BurnySc2/sc2-planner/issues):

-   Change Website icon
-   Improve GUI looks
-   Add SALT encoding and decoding
-   Grey out actions / icons that are currently not available (locked by techtree)
