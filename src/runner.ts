import * as core from '@actions/core'
import * as inputsHelper from './inputsHelper'
import * as githubHelper from './githubHelper'
import * as utils from './utils'
import {IParams} from './paramsHelper'

export async function run(): Promise<void> {
  try {
    await utils.validateEventType()

    const params: IParams = await inputsHelper.getInputs()

    const ghHelper: githubHelper.IGithubHelper = await githubHelper.CreateGithubHelper(
      params.token
    )

    if (params.ignoreForks && (await ghHelper.isFork())) {
      core.info('ignoring PR from fork...')
    } else {
      await ghHelper.setStatus(params)
    }

    if (params.addHoldComment) {
      await ghHelper.addComment(params.selectedComment)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
