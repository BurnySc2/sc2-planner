# SC2 Planner

This is a (hopefully better) remake of the [original (but deprecated) sc2planner](http://web.archive.org/web/20130815065430/http://www.sc2planner.com/?v=hots#P) from scratch, written in [React](https://reactjs.org/) and [Typescript](https://www.typescriptlang.org/).

You can create build orders for [StarCraft 2 Legacy of the Void](https://starcraft2.com/en-us/), and this web-application will simulate/calculate the time at which those actions can be executed.

# Live Demo

You can [find a live version here](https://burnysc2.github.io/sc2-planner)

## Examples

### Terran

[Reaper expand into reactored hellions and banshee](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=uDritmrisSJEritSf2HtL2NtZU2HsMN2PtkuBtgV2KritnfibViriuFsExagsJRxaJtjkilTkli2Mx3ixaasKzaDyUZsKIyx9yxTxZJtR3QtZfe07ksLx1KzLT1cKtleZkx2KsQx1bsPzMzyrKzLTywKzLN1UbzJKySTx3asIx3bsL08cyXayxb1zYsJLxbK0ItzocsJOyyZzPZyuasPxzYsLxaKzKSsNLxdJtleZkxYhsJR1U1zjZxzasJxaKx0p0XwzEbxyKzEPsKIyPKtgXiRU1MKsNySKyqGtNuF)

[A version of the 211 16 marine drop](https://burnysc2.github.io/sc2-planner/?&race=terran&bo=uDritmrisSJEritSf2HtL2NtZU2HsMN2PtkuBtgV2KritnfibViriuFsExagsJRxaJtjkilTkli2Mx3ixaasKzaDyUZsKIyx1sKxZJtR2ztZfezn9sJLySKzLT1cKtleZkx2KsQx1bsJx1KxdSsP0GysKJyTbsLzQcsKI0lc16zxabzOK12NxYZyNZsL1vK0bTxcJtR2ZtZfexZKx2csJLx4K1VT0E90EMzKKzkPyOyzb9zbmsJxzKtlgXiRU1fjypZsJRxaJtjkil3ttliySLx3ZsKysKx3TsIxdc1t9zKM02902sz59z592QsPxZJtR41tZfe0v9xdhzlKyxPsJMzOZ1p90BMsNynKxyNxYYylysP0OZxzZ0owsKKxYJtjkil3qtli2MxdlzKzxyZsJRysbxdWtNuF)

### Protoss

[Gateway expand into 1 gas 7 gate chargelot allin](https://burnysc2.github.io/sc2-planner/?&race=protoss&bo=uDritmrisSJEritSf2HtL2NtZU2HsQM2PtkuBtgV2KritnfibViriuFsExagsOIxaJtjkilTkli2Mx3ixaasKzaDxaHtR3RtZfeyuKsKyu1sOyUKzo9zoKznYxzasNRzKbsP0h207bsIyU1sK11K0ipxaLtlgXiRUysKsONzM9zM3yR9xa7sO1UZsIzIYxZysOKxaJtjkil2dtliyrKxd60gax39zu11IKxdSsKO1lYxa9xa9xai0cdxd9xdasPLxdJtleZkxY9xY9xY9xYSsKxYKtR57tZfexa9zc9xY9xY9xY9xYltNuF)

### Zerg

[17 Hatch, 17 pool, 16 gas](https://burnysc2.github.io/sc2-planner/?&race=zerg&bo=uDritmrisSJEritSf2HtL2NtZUxODsIM2QtkuBtgV2LritnfibViriuFsExbIsOxbJtleZkxZLx0bxb9xbSsQzKKtjkilTkli2Mx4ksRx4bsQQyY2xb2sKxZJtR3ttZfeySm1EKtleZkxZKsKxZxsINxZotNuF)

## Hotkeys

With the arrow keys (left and right) you can navigate through the build order. Holding `shift` will jump by 5, and holding `ctrl` will jump to the start with left arrow or to the end with right arrow.

# Development - Building it yourself

## Requirements

[Node 10 or newer](https://nodejs.org/en/download/) is required to create this static website.

[Python 3.7 or newer](https://www.python.org/downloads/) is required to run pre-commit hooks and e2e tests.

## Setup

```
npm install
pip install poetry --user
poetry install
poetry run pre-commit install
```

## Deploy

### Test

`npm run test`

### End-to-end test

`poetry run pytest test/test_e2e.py`

### Develop
To start dev server:

`npm run start`

Then go to [localhost:3000](http://localhost:3000)

### Build and deploy
To deploy in `/build` directory:

`npm run build`

### Pre-commit hooks

To run pre-commit hooks manually, run

```
poetry run pre-commit install
poetry run pre-commit run --all-files
```

## Update

To update to the current patch, a freshly generated `data.json` from [SC2 Techtree](https://github.com/BurnySc2/sc2-techtree) is required and needs to be placed in `src/constants/data.json`. If a new unit, structure or upgrade was introduced, then its icon needs to be placed in the `src/icons/png` directory.

# Copyright

Most image assets are owned by Blizzard and are used according to http://blizzard.com/company/about/legal-faq.html.

©Blizzard Entertainment, Inc. All rights reserved. Wings of Liberty, Heart of the Swarm, Legacy of the Void, StarCraft, Brood War, Battle.net, and Blizzard Entertainment are trademarks or registered trademarks of Blizzard Entertainment, Inc. in the U.S. and/or other countries.

# Other

Prettify all .ts and .tsx files:

`npm run format`

# TODO

Tasks that still need to be done, also see the [issues page](https://github.com/BurnySc2/sc2-planner/issues):

-   Improve GUI looks
-   Add SALT encoding and decoding
-   Grey out actions / icons that are currently not available (locked by techtree)
-   Sort zerg townhalls by how much larva it has (build units from hatchery first which has the most free larva)
-   Sort terran production structures by: `has reactor`, `has no addon`, `has techlab` when trying to queue new units that do not require a techlab.
