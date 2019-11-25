# Github Action commit-status-updater

## Overview

A simple Github Action that allows us to update the status of a given commit.

GitHub does not update the status of a commit when running workflow and therefore tools that rely on the context/status of a given commit are not compatible with it.

## Input Parameters

* context: The context for the status
  * optional
  * default:  GithubActions - ${GITHUB_WORKFLOW}
* state: Commit state. Possible values are 'pending', 'success', 'error' or 'failure'
  * optional
  * default:  pending
* token: The Github token
  * required

## Example action

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: ouzi-dev/commit-status-updater@v0.1.0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - name: Test
      run: |
        echo this should always pass after 2 minutes
        sleep 2m
        echo pass
    - if: success()
    - uses: ouzi-dev/commit-status-updater@v0.1.0
      with: 
        state: success
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - if: failure()
    - uses: ouzi-dev/commit-status-updater@v0.1.0
      with: 
        state: failure
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```


## Integration with Prow

An example is [Prow](https://github.com/kubernetes/test-infra/tree/master/prow) which uses the Github Status API to read the status of a given commit. 
Using this actions you can tell tide to not skip optional contexts and effectively wait for a GitHub Workflow to pass before merging.

### Example with Tide

```
tide:
  context_options:
<<<<<<< HEAD
    # Treat unknown contexts as required
    skip-unknown-contexts: false
=======
    from-branch-protection: true
>>>>>>> 85bdd958c28e5e42ebfdd25f2ceff8241f3d9c66
```