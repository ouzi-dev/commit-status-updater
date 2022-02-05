# Github Action commit-status-updater

![Build and test](https://github.com/ouzi-dev/commit-status-updater/workflows/Build%20and%20test/badge.svg)
![PR Build and test](https://github.com/ouzi-dev/commit-status-updater/workflows/PR%20Build%20and%20test/badge.svg)

## Overview

A simple Github Action that allows us to update the status of a commit.

GitHub does not update the status of a commit when running workflow and therefore tools that rely on the context/status of a given commit are not compatible with it.

Currently the action supports `pull_request` and `push` events:
* When the event is `pull_request`, the action will set the status to the last commit in the pull request at the moment the workflow was triggered.
* When the event is `push`, the action will set the status to the last commit pushed at the moment the workflow was triggered.

## Input Parameters

| Name | Required | Description | Default | Accepted values |
|---|---|---|---|---|
| `token` | :heavy_check_mark: | Auth token used to add status commits | `${ github.token }` | `^[0-9a-f]{40}$` |
| `name` | :heavy_check_mark: | Name of the status check to add to the commit | `GithubActions - ${GITHUB_WORKFLOW}` | Any string |
| `status` | :heavy_check_mark: | Commit or job status, based on this the action will set the correct status in the commit. See below for details. | `pending` | `error`, `failure`, `pending`, `success` and `cancelled` |
| `url` |  | URL for the status check | `""` | Any string |
| `description` |  | Description for the status check | `""` | Any string |

### `status`

If set to `pending` it will set status commit `pending`.

If set to `failure` or `cancelled` it will set status commit `failure`.

If set to `success` it will set status commit `success`.

If set to `error` it will set status commit `error`.

## Input Parameters specific to `pull_request` event

_These parameters are all optional and are used only for pull requests_

| Name | Description |
|---|---|
| `ignoreForks` | Default is `true`. If the pull request is from a fork the action won't add a status by default. This is because the action won't have a token with permissions to add the status to the commit. You can disable this, but then you'll have to provide a token with enough permissions to add status to the commits in the forks! |
| `addHoldComment` | Default is `false`. If `true` the action will add a comment to the pull request. This is useful if you use prow, since prow won't detect the GitHub actions, so you can use `/hold` and `/hold cancel` to avoid merging the PR before you want. __Important: this will be disabled for forks if `ignoreForks` is set to `true`, this is because the default GitHub token won't have permissions to add comments if your PR comes from a fork.__ |
| `pendingComment` | Default is `/hold`. This is the message to add to the pull request when the status is `pending`. |
| `successComment` | Default is `/hold cancel`. This is the message to add to the pull request when the status is `success`. |
| `failComment` | Default is `/hold`. This is the message to add to the pull request when the status is `failure`, `error` or `cancelled`. |

## Examples 

### Action sets push commit to pending status

```
name: Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
```

### Action sets push commit to pending status with custom name

```
name: Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
      with:
        name: "name of my status check"
    - uses: ouzi-dev/commit-status-updater@v1.1.0
```

### Action sets push commit to pending status on start, and updates check at the end of the workflow

```
name: Test

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
    - if: always()
      uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        status: "${{ job.status }}"
```

### Action sets pull request commit to pending status without comment

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
```

### Action sets pull request commit to error status without comment

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        status: "error"
```

### Action sets pull request commit to pending status with comment, and updates check and adds comment at the end of the workflow

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        addHoldComment: "true"
    - if: always()
      uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        addHoldComment: "true"
        status: "${{ job.status }}"
```

### Action with custom hold comments

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        status: "pending"
        addHoldComment: "true"
        pendingComment: "action pending!"
        successComment: "action success!"
        failComment: "action failed!"
```
 
### Action no comments, set commit to "error" status and set url, description and specific name

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        status: "error"
        url: http://myurl.io/
        description: "this is my status check"
        name: "name of my status check"
```

### Action with specific token and setting status check in commits in forks

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.1.0
      with:
        token: "my_custom_token"
        ignoreForks: "false"
```

## Integration with Prow

An example is [Prow](https://github.com/kubernetes/test-infra/tree/master/prow) which uses the Github Status API to read the status of a given commit. 
Using this actions you can tell tide to not skip optional contexts and effectively wait for a GitHub Workflow to pass before merging.

### Example with Tide

```
tide:
  context_options:
    # Treat unknown contexts as required
    skip-unknown-contexts: false
```

## Development

__Important: Before pushing your changes run `make release` to generate all the correct files and clean stuff, etc...__
