import * as github from '@actions/github'
import * as core from '@actions/core'
import {WebhookPayloadPullRequest} from '@octokit/webhooks'
import {IParams} from './paramsHelper'

export interface IGithubHelper {
  isFork(): boolean
  setStatus(params: IParams): void
  addComment(comment: string): void
}

export function CreateGithubHelper(token: string): IGithubHelper {
  return GithubHelper.createGithubHelper(token)
}

class GithubHelper {
  private payload
  private owner
  private repo
  private sha
  private issueNumber
  private octokit

  private constructor() {}

  static createGithubHelper(token: string): GithubHelper {
    const result = new GithubHelper()
    result.initialize(token)
    return result
  }

  private initialize(token: string): void {
    this.octokit = new github.GitHub(token)
    this.payload = github.context.payload as WebhookPayloadPullRequest
    this.owner = this.payload.pull_request.head.repo.owner.login
    this.repo = this.payload.pull_request.head.repo.name
    this.sha = this.payload.pull_request.head.sha
    this.issueNumber = this.payload.pull_request.number
  }

  isFork(): boolean {
    const baseRepo = this.payload.pull_request.base.repo.full_name
    const headRepo = this.payload.pull_request.head.repo.full_name

    return baseRepo !== headRepo
  }

  setStatus(params: IParams): void {
    this.octokit.repos
      .createStatus({
        context: params.name,
        description: params.description,
        owner: this.owner,
        repo: this.repo,
        sha: this.sha,
        state: params.status,
        target_url: params.url
      })
      .then(() => {
        core.info(`Updated build status: ${params.status}`)
      })
      .catch(error => {
        core.setFailed(`error while setting context status: ${error.message}`)
      })
  }

  addComment(comment: string): void {
    this.octokit.issues
      .createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: this.issueNumber,
        body: comment
      })
      .then(() => {
        core.info(`Comment added to pull request`)
      })
      .catch(error => {
        core.setFailed(
          `error while adding comment to pull request: ${error.message}`
        )
      })
  }
}
