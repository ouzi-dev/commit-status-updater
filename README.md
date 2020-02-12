# Github Action commit-status-updater

![](https://github.com/ouzi-dev/commit-status-updater/workflows/Build%20and%20test/badge.svg)
![](https://github.com/ouzi-dev/commit-status-updater/workflows/PR%20Build%20and%20Test/badge.svg)

## Overview

A simple Github Action that allows us to update the status of the last commit in a pull request.

GitHub does not update the status of a commit when running workflow and therefore tools that rely on the context/status of a given commit are not compatible with it.

## Input Parameters

* token: Auth token used to add status commits
  
  * required
  * default: ${ github.token }
  
* name: The Name of the status check to add to the commit
  * required
  * default:  GithubActions - ${GITHUB_WORKFLOW}
  
* status: If `singleShot` is set to `true` this has to be a valid commit status. Valid commit status are: `error`, `failure`, `pending` and `success`.

  If `singleShot` is set to `false` this has to be a valid job status. Valid job status are: `success`, `failure` and `cancelled`.
  * required
  * default: ${ job.status }
  
* singleShot: If "true" the action won't run the post step and the action will expect a valid commit status in the input "status".
  
  If "false" the action expects a valid job status and will run the post step.
  * optional
  * default: "false"

* url: URL for the status check.

  * optional
  * default: ""

* description: Description for the status check.

  * optional
  * default: ""

* ignoreForks: If the pull request is from a fork the action won't add a status by default. This is because the action won't have a token with permissions to add the status to the commit. You can disable this, but then you'll have to provide a token with enough permissions to add status to the commits in the forks!

  * optional
  * default: "true" 

* addHoldComment: If true the action will add a comment at the beginning and at the end. This is useful if you use prow and you get PRs from forks, you can use `/hold` and `/hold cancel` instead of the status check since the token won't have permissions to do that. Warning: Be careful using this with `singleShot = true`, since you won't add a message at the end!

  * optional
  * default: "false"

* pendingComment: This is the message to add to the pull request when the action is configured with singleShot and the provided status is pending, or if it's not singleShot, the provided status is success and is not post action.

  * optional
  * default: "/hold"

* successComment: This is the message to add to the pull request when the provided status is success, singleShot is false and is post action, or if the provided status is success and singleShot is true.

  * optional
  * default: "/hold cancel"

* failComment: This is the message to add to the pull request when the status is failure or error.

  * optional
  * default: "/hold cancel"
  
## Examples 

### Action with post and default values

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.0.0
```

### Action with no post, default values, add comments and set status if error or cancel

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.0.0
      with:
        singleShot: "true"
        addHoldComment: "true"
    - if: always()
      uses: ouzi-dev/commit-status-updater@v1.0.0
      with:
        singleShot: "true"
        addHoldComment: "true"
```

### Action with post and custom hold comments

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.0.0
      with:
        addHoldComment: "true"
        pendingComment: "action pending!"
        successComment: "action success!"
        failComment: "action failed!"
```
 
### Action with no post, no comments, set commit to "pending" status and set url, description and specific name

```
name: Test

on: [pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: ouzi-dev/commit-status-updater@v1.0.0
      with:
        singleShot: "true"
        status: "pending"
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
    - uses: ouzi-dev/commit-status-updater@v1.0.0
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