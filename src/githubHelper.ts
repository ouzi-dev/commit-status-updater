import * as core from '@actions/core'
import * as github from '@actions/github'
import {EventPayloads} from '@octokit/webhooks'
import {IParams} from './paramsHelper'

export interface IGithubHelper {
  isFork(): Promise<boolean>
  setStatus(params: IParams): Promise<void>
  addComment(comment: string): Promise<void>
  isPullRequest(): Promise<boolean>
}

export async function CreateGithubHelper(
  token: string
): Promise<IGithubHelper> {
  return await GithubHelper.createGithubHelper(token)
}

class GithubHelper {
  private payload
  private owner
  private repo
  private sha
  private issueNumber
  private octokit
  private isPR

  private constructor() {}

  static async createGithubHelper(token: string): Promise<GithubHelper> {
    const result = new GithubHelper()
    await result.initialize(token)
    return result
  }

  private async initialize(token: string): Promise<void> {
    this.octokit = github.getOctokit(token)
    if (github.context.eventName === 'pull_request') {
      this.isPR = true
      this.payload = github.context
        .payload as EventPayloads.WebhookPayloadPullRequest
      this.owner = this.payload.pull_request.head.repo.owner.login
      this.repo = this.payload.pull_request.head.repo.name
      this.sha = this.payload.pull_request.head.sha
      this.issueNumber = this.payload.pull_request.number
    }

    if (github.context.eventName === 'push') {
      this.isPR = false
      this.payload = github.context.payload as EventPayloads.WebhookPayloadPush
      this.owner = this.payload.repository.owner.login
      this.repo = this.payload.repository.name
      this.sha = github.context.sha
    }
  }

  async isPullRequest(): Promise<boolean> {
    return this.isPR
  }

  async isFork(): Promise<boolean> {
    const baseRepo = this.payload.pull_request.base.repo.full_name
    const headRepo = this.payload.pull_request.head.repo.full_name

    return baseRepo !== headRepo
  }

  async setStatus(params: IParams): Promise<void> {
    try {
      await this.octokit.repos.createCommitStatus({
        context: params.name,
        description: params.description,
        owner: this.owner,
        repo: this.repo,
        sha: this.sha,
        state: params.status,
        target_url: params.url
      })
      core.info(`Updated build status: ${params.status}`)
    } catch (error) {
      throw new Error(`error while setting context status: ${error.message}`)
    }
  }

  async addComment(comment: string): Promise<void> {
    // if we support forks, then we need to use the base, cause head will be the fork
    const baseOwner = this.payload.pull_request.base.repo.owner.login
    const baseRepo = this.payload.pull_request.base.repo.name
    try {
      await this.octokit.issues.createComment({
        owner: baseOwner,
        repo: baseRepo,
        issue_number: this.issueNumber,
        body: comment
      })
      core.info(`Comment added to pull request`)
    } catch (error) {
      throw new Error(
        `error while adding comment to pull request: ${error.message}`
      )
    }
  }
}
