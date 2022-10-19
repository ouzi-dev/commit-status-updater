import * as core from '@actions/core'
import * as inputsHelper from './inputsHelper'
import * as githubHelper from './githubHelper'
import * as utils from './utils'
import {IParams} from './paramsHelper'

export async function run(): Promise<void> {
  try {
    await utils.validateEventType()

    const params: IParams = await inputsHelper.getInputs()

    const ghHelper: githubHelper.IGithubHelper =
      await githubHelper.CreateGithubHelper(params.token)

    if (await ghHelper.isPullRequest()) {
      if (params.ignoreForks && (await ghHelper.isFork())) {
        core.info('ignoring PR from fork...')
      } else {
        await ghHelper.setStatus(params)
        // for now only add comments if it's not a fork or we explicitly say don't ignore forks
        // we should have a token with permissions in the fork for this
        if (params.addHoldComment) {
          await ghHelper.addComment(params.selectedComment)
        }
      }
    } else {
      await ghHelper.setStatus(params)
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}
