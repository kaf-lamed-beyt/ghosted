# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.3](https://github.com/kaf-lamed-beyt/ghosted/compare/v0.0.2...v0.0.3) (2025-10-23)


### Bug Fixes

* inconsistent followers and ghosts lookup ([#15](https://github.com/kaf-lamed-beyt/ghosted/issues/15)) ([b4fd601](https://github.com/kaf-lamed-beyt/ghosted/commit/b4fd601d3395e0afc302fa0ce86117d4e2bd4ed0))

### [0.0.2](https://github.com/kaf-lamed-beyt/ghosted/compare/v0.0.1...v0.0.2) (2025-07-27)


### Bug Fixes

* fixed a bug where db writes were performed on every snapshot ([#8](https://github.com/kaf-lamed-beyt/ghosted/issues/8)) ([66fe49e](https://github.com/kaf-lamed-beyt/ghosted/commit/66fe49e27fa7a69a6982d59b260f23560515fc06))
* **ui:** fixed a ui bug where followers count is stale in the TabItem ([#10](https://github.com/kaf-lamed-beyt/ghosted/issues/10)) ([50f5b64](https://github.com/kaf-lamed-beyt/ghosted/commit/50f5b641ff8bd46fe9a761c820b0f073bda60412))

### 0.0.1 (2025-07-14)


### Features

* add database setup and auth ([38f49e7](https://github.com/kaf-lamed-beyt/ghosted/commit/38f49e7a1307e1080611b39262ca2f93a26dddd1))
* setup jobs for bi-hourly snapshots and a weekly (email) run-through of followers ([#3](https://github.com/kaf-lamed-beyt/ghosted/issues/3)) ([3dd8f67](https://github.com/kaf-lamed-beyt/ghosted/commit/3dd8f67e0f2b1384be3cd08c43c00de31240fee1))
* show followers and ghosts ([#2](https://github.com/kaf-lamed-beyt/ghosted/issues/2)) ([ccf87bf](https://github.com/kaf-lamed-beyt/ghosted/commit/ccf87bf5f701a7d834820e977c6adac2b7da5b64))


### Bug Fixes

* verify all cron signatures ([#6](https://github.com/kaf-lamed-beyt/ghosted/issues/6)) ([69025f1](https://github.com/kaf-lamed-beyt/ghosted/commit/69025f1d05d343915c95c0213356d772a5177ab5))
