# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this application will calculate at the time those actions can be executed.

# Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner)

## Examples

### Terran

[Reaper expand into reactored hellions](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=tLuDriteRdVrisSritDsbtGrisEritkuBtgxNEtnfibViriuFsExfptlggcuBsctVgfkxnKtjkilTkli2MyMrxfesatRiiRTbjyoftCVWZe26uBzS9xfgsLuArgslypDrgtXRzVL4jtkZfeyJrsntiSZkRcsbtfddReU0hhtR2d3CxlJtle28xgMyJHsbtVekxnMyPVsb34tcrgtUfne5PtFskd0L7tDlggcuBsctVgf4Sy2esltRiZe2J0IZysfsezhD2VuByofyIftCVWzKDyJhsa4xti3ytbj2vy4Fy39xfgsLuArgslzaDrgtXRjxnKy6DtZfexnMsntiS67tRcsbtfddReUzY92f3Mtig2WtkyJfsktZWkrg1XIrgtWi4Brg1dRzvSsexiFuBrg2FxzDtV5hxzjz1fsb6DtcrgtUfne61tFskdyMcsgtV2qxTExjJtleZ5vxhsyvqz7fxf90S9zG6tN)

### Protoss

[Gateway expand into 7gate chargelot allin](https://burnysc2.github.io/sc2-planner/?&race=protoss&bo=tLuDriteRdVrisSritAifS2IsEritkuBtgxPEtnfibViriuFsExhruBtcfexhKtjkilTkli2MyItxhgsbtY2itefrgsmtVuAtljxoKtR3ttZzDDxoLsftRkVnRuBzW9xSDsZtjjZdZc3Q2ayO9xhksLuArgsltZeVrgtXR0jdyLh1oPz0VsbuB3Hti3v3ftTjsb3EySL1z91z9xhIuBtc05DyI92StHRigsf4UtVCVjV2LtTYxsKtlgXiRUyRNsLuArgsltZ6YrgtXRjxoKtR34tZzODxnLtEn5qtZXYk68tleT2Lzp9xSDtD64tgrgtdy7jyN9yN9yNay29y29xpisbtYRiXy3LtlgXiRU2Kzcsxh9xh9xhKsftRkVnRuBxjKtjkil53tli0UNxm9xm9xm9xmHtKVRcfkxlKtleZ2O1xMuB2fteytjrgtkfrgtHRigXxMDxvKtR2stZyCDxs9xs9xs9xs9xsftAuBtcxRDxhJtjkil2ktli2MxkLtKVR2ltkxlKtleZ2Oxg9xg9xg9xg9xg9xg9xg9tAuB2ftexfKtjkilTkli2MxkvzO9xg9xg9109109zu9xg9xg9xgWtN)

### Zerg

[17 Hatch, 17 Pool, 16 gas](https://burnysc2.github.io/sc2-planner/?&race=zerg&bo=tLuDriteRdVrisSrisctife2IsEritkuBtgxPEtnfibViriuFsExhJsntm2Qtc2WtUxkKtleZkxiMyGhxh9xhmsgtRkTY2TuBxkKtjkilTkli2MyLstDgRn5oteXAffcyPfsduA2WtR2W3Gy39xh9xhIsLuArgsl47tVrgtXRjxnKziDtZ24yLtsntm2Qtc2WtUxkKtl6ZtkxiMtBlVV3Xxf4tK3itXc4vtXxiytN)

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
