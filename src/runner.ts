import * as core from '@actions/core'
import * as inputsHelper from './inputsHelper'
import * as githubHelper from './githubHelper'
import * as utils from './utils'
import {IParams} from './paramsHelper'

export function run(): void {
  try {
    utils.validateEventType()

    const params: IParams = inputsHelper.getInputs()

    const ghHelper = githubHelper.CreateGithubHelper(params.token)

    if (params.ignoreForks && ghHelper.isFork()) {
      core.info('ignoring PR from fork...')
    } else {
      ghHelper.setStatus(params)
    }

    if (params.addHoldComment) {
      ghHelper.addComment(params.selectedComment)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
