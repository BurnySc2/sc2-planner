# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this application will calculate at the time those actions can be executed.

# Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner)

## Examples

### Terran

[Reaper expand into reactored hellions](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=uDritmrisSJEritSf2HtL2NtZU2HsMN2PtkuBtgV2KritnfibViriuFsExagsJRxaJtjkilTkli2Mx3ixaasKzaDyUZsKIyx9yxTxZJtR3QtZfe07ksLx1KzLT1cKtleZkx2KsQx1bsPzMzyrKzLTywKzLN1UbzJKySTx3asIx3bsL08cyXayxb1zYsJLxbK0ItzocsJOyyZzPZyuasPxzYsNLxaJtleZkxYhyMZzCaxa0zdwynttNuF)

[A version of the 211 16 marine drop](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=uDritmrisSJEritSf2HtL2NtZU2HsMN2PtkuBtgV2KritnfibViriuFsExagsJRxaJtjkilTkli2Mx3ixaasKzaDyUZsKIyx1sKxZJtR2ztZfezn9sJLySKzLT1cKtleZkx2KsQx1bsJx1KxdSsP0GysKJyTbsLzQcsKI0lc16zxabzOK12NxYYsL1VK0BT1xYsKx2czjasJLyVKx4T0EvzKKzkP1qzxyyzbwsJymKtlgXiRU1FjzcaxaZsKyPKtjkil4KtliysLsIxdczM9xaosJRzJcyUazj9zJ9x3JzJKtR20tZfexaKsMxaYsPxZYyqasNyQK0zNxYY1mZxYYzAZxabyPX0ozzdzxyQtNuF)

### Protoss

[Gateway expand into 1 gas 7 gate chargelot allin](https://burnysc2.github.io/sc2-planner/?&race=protoss&bo=uDritmrisSJEritSf2HtL2NtZU2HsQM2PtkuBtgV2KritnfibViriuFsExagsOIxaJtjkilTkli2Mx3ixaasKzaDxaHtR3RtZfeyuKsKyu1sOyUKzo9zoKznYxzasNRzKbsP0h207bsIyU1sK11K0ipxaLtlgXiRUysKsONzM9zM3yR9xa7sO1UZsIzIYxZyzg0sOKxaJtjkil3UtliziKxd9xd9xdY1IKxdSsKO1lYxa9xa9xai0cdxd9xdasPLxdJtleZkxY9xY9xY9xYSsKxYKtR57tZfexa9zc9xY9xY9xY9xYltNuF)

### Zerg

[17 Hatch, 17 pool, 16 gas](https://burnysc2.github.io/sc2-planner/?&race=zerg&bo=uDritmrisSJEritSf2HtL2NtZUxODsIM2QtkuBtgV2LritnfibViriuFsExbIsOxbJtleZkxZLx0bxb9xbSsQzKKtjkilTkli2Mx4ksRx4bsQQyY2xb2sKxZJtR3ttZfeySm1EKtleZkxZKsKxZxsINxZotNuF)

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

`npm run start`

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

-   Improve GUI looks
-   Add SALT encoding and decoding
-   Grey out actions / icons that are currently not available (locked by techtree)
-   Sort zerg townhalls by how much larva it has (build units from hatchery first which has the most free larva)
-   Sort terran production structures by: `has reactor`, `has no addon`, `has techlab` when trying to queue new units that do not require a techlab.
-   Add snapshots [as described here](https://www.reddit.com/r/starcraft2/comments/g66i2p/build_order_planner_website/foeu08a/) so that you can click the time bar and it shows you the status of resources and amount of units at a certain time
