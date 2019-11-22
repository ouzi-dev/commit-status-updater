# Github Action commit-status-updater

## Overview

A simple Github Action that allows us to update the status of a given commit.

GitHub does not update the status of a commit when running workflow and therefore tools that rely on the context/status of a given commit are not compatible with it.
An example is [Prow](https://github.com/kubernetes/test-infra/tree/master/prow) which uses the Github Status API to read the status of a given commit. 

## Integration with Prow

If using [Prow](https://github.com/kubernetes/test-infra/tree/master/prow) you can now add GitHub Workflows as required checks.

### Example with Branch Protection and Tide
branch-protection:
```
branch-protection:
  orgs:
    {MY_ORG}:
      repos:
        {MY_REPO}:
          branches:
            master:
              protect: true  # enable protection
              enforce_admins: true  # rules apply to admins
              required_status_checks:
                contexts: 
                  - "GithubActions - {WORKFLOW_NAME}"
              restrictions: # restrict who can push to the repo
                users:
                - ouzibot
```
tide:
```
tide:
  context_options:
    from-branch-protection: true
```

## Example action

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: ouzi-dev/github-action-commit-status-updater@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - name: Test
      run: |
        echo this should always pass after 2 minutes
        sleep 2m
        echo pass
    - if: success()
    - uses: ouzi-dev/github-action-commit-status-updater@master
      with: 
        state: success
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - if: failure()
    - uses: ouzi-dev/github-action-commit-status-updater@master
      with: 
        state: failure
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```