#!/bin/bash 
set -eo pipefail

# Set Defaults if non provided
INPUT_CONTEXT=${INPUT_CONTEXT:-GithubActions - ${GITHUB_WORKFLOW}}

# Chech all inputs have been provided
[[ -z "${INPUT_STATE}" ]] && { echo "Error: INPUT_STATE not found"; exit 1; }
[[ -z "${GITHUB_REPOSITORY}" ]] && { echo "Error: GITHUB_ORG not found"; exit 1; }
[[ -z "${GITHUB_TOKEN}" ]] && { echo "Error: GITHUB_TOKEN not found"; exit 1; }

# Extract the org, repo and get the sha1
GITHUB_ORG=$(echo "${GITHUB_REPOSITORY}" | awk -F/ '{print $1}')
GITHUB_REPO=$(echo "${GITHUB_REPOSITORY}" | awk -F/ '{print $2}')
LAST_COMMIT_SHA=$(git rev-list --no-merges -n 1 HEAD) # get latest non merge commit as github checks out refs/remotes/pull/X/merge instead of the branch

# Check that everything is as expected 
[[ -z "${GITHUB_ORG}" ]] && { echo "Error: GITHUB_ORG is empty"; exit 1; }
[[ -z "${GITHUB_REPO}" ]] && { echo "Error: GITHUB_REPO is empty"; exit 1; }
[[ -z "${LAST_COMMIT_SHA}" ]] && { echo "Error: LAST_COMMIT_SHA is empty"; exit 1; }

echo "** Setting status ${INPUT_STATE} for ${LAST_COMMIT_SHA} in ${GITHUB_ORG}/${GITHUB_REPO}"

# set the status
# https://github.com/cloudposse/github-status-updater
exec github-status-updater -action update_state \
    -context "${INPUT_CONTEXT}" \
    -owner "${GITHUB_ORG}" \
    -repo  "${GITHUB_REPO}" \
    -state "${INPUT_STATE}" \
    -token "${GITHUB_TOKEN}" \
    -ref "${LAST_COMMIT_SHA}"