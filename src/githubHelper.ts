import * as github from '@actions/github'
import * as core from '@actions/core'
import {WebhookPayloadPullRequest} from '@octokit/webhooks'
import {IParams} from './paramsHelper'

export interface IGithubHelper {
  isFork(): Promise<boolean>
  setStatus(params: IParams): Promise<void>
  addComment(comment: string): Promise<void>
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

  private constructor() {}

  static async createGithubHelper(token: string): Promise<GithubHelper> {
    const result = new GithubHelper()
    await result.initialize(token)
    return result
  }

  private async initialize(token: string): Promise<void> {
    this.octokit = new github.GitHub(token)
    this.payload = github.context.payload as WebhookPayloadPullRequest
    this.owner = this.payload.pull_request.head.repo.owner.login
    this.repo = this.payload.pull_request.head.repo.name
    this.sha = this.payload.pull_request.head.sha
    this.issueNumber = this.payload.pull_request.number
  }

  async isFork(): Promise<boolean> {
    const baseRepo = this.payload.pull_request.base.repo.full_name
    const headRepo = this.payload.pull_request.head.repo.full_name

    return baseRepo !== headRepo
  }

  async setStatus(params: IParams): Promise<void> {
    try {
      await this.octokit.repos.createStatus({
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
