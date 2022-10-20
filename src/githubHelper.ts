import * as core from '@actions/core'
import {context, getOctokit} from '@actions/github'
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
  private owner
  private repo
  private sha
  private issueNumber
  private octokit
  private isPR
  private baseRepo
  private headRepo
  private baseOwner
  private baseRepoName

  private constructor() {}

  static async createGithubHelper(token: string): Promise<GithubHelper> {
    const result = new GithubHelper()
    await result.initialize(token)
    return result
  }

  private async initialize(token: string): Promise<void> {
    this.octokit = getOctokit(token)
    if (context.eventName === 'pull_request') {
      this.isPR = true
      this.owner = context.payload?.pull_request?.head?.repo?.owner?.login
      this.repo = context.payload?.pull_request?.head?.repo?.name
      this.sha = context.payload?.pull_request?.head?.sha
      this.issueNumber = context.payload?.pull_request?.number
      this.baseRepo = context.payload?.pull_request?.base?.repo?.full_name
      this.headRepo = context.payload?.pull_request?.head?.repo?.full_name
      this.baseOwner = context.payload?.pull_request?.base?.repo?.owner?.login
      this.baseRepoName = context.payload?.pull_request?.base?.repo?.name
    }

    if (context.eventName === 'push') {
      this.isPR = false
      this.owner = context.payload?.repository?.owner?.login
      this.repo = context.payload?.repository?.name
      this.sha = context.sha
    }
  }

  async isPullRequest(): Promise<boolean> {
    return this.isPR
  }

  async isFork(): Promise<boolean> {
    return this.baseRepo !== this.headRepo
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
      throw new Error(
        `error while setting context status: ${(error as Error).message}`
      )
    }
  }

  async addComment(comment: string): Promise<void> {
    // if we support forks, then we need to use the base, cause head will be the fork
    try {
      await this.octokit.issues.createComment({
        owner: this.baseOwner,
        repo: this.baseRepoName,
        issue_number: this.issueNumber,
        body: comment
      })
      core.info(`Comment added to pull request`)
    } catch (error) {
      throw new Error(
        `error while adding comment to pull request: ${
          (error as Error).message
        }`
      )
    }
  }
}
