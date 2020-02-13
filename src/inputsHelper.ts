import * as core from '@actions/core'
import * as paramsHelper from './paramsHelper'

const STATUS_PARAM = 'status'
const TOKEN_PARAM = 'token'
const URL_PARAM = 'url'
const DESCRIPTION_PARAM = 'description'
const NAME_PARAM = 'name'
const IGNORE_FORKS_PARAM = 'ignoreForks'
const ADD_HOLD_COMMENT_PARAM = 'addHoldComment'
const PENDING_COMMENT_PARAM = 'pendingComment'
const SUCCESS_COMMENT_PARAM = 'successComment'
const FAIL_COMMENT_PARAM = 'failComment'

async function isEmptyString(str: string): Promise<boolean> {
  return !str || str.length === 0
}

async function validateString(str: string, paramName: string): Promise<void> {
  if (await isEmptyString(str)) {
    throw new TypeError(`${paramName} can't be an empty string`)
  }
}

export async function getInputs(): Promise<paramsHelper.IParams> {
  const result = ({} as unknown) as paramsHelper.IParams

  result.token = core.getInput(TOKEN_PARAM)

  await validateString(result.token, TOKEN_PARAM)

  result.name = core.getInput(NAME_PARAM)

  await validateString(result.name, NAME_PARAM)

  const status = core.getInput(STATUS_PARAM)

  await validateString(status, STATUS_PARAM)

  result.status = await paramsHelper.getStatus(status)

  result.url = core.getInput(URL_PARAM) || ''
  result.description = core.getInput(DESCRIPTION_PARAM) || ''

  const ignoreForks = core.getInput(IGNORE_FORKS_PARAM)

  if (await isEmptyString(ignoreForks)) {
    result.ignoreForks = true
  } else {
    result.ignoreForks = !(ignoreForks.toLowerCase() === 'false')
  }

  const addHoldComment = core.getInput(ADD_HOLD_COMMENT_PARAM)

  if (await isEmptyString(addHoldComment)) {
    result.addHoldComment = false
  } else {
    result.addHoldComment = addHoldComment.toLowerCase() === 'true'
  }

  result.pendingComment = core.getInput(PENDING_COMMENT_PARAM) || ''
  result.successComment = core.getInput(SUCCESS_COMMENT_PARAM) || ''
  result.failComment = core.getInput(FAIL_COMMENT_PARAM) || ''

  const selectedComment = await paramsHelper.getMessageForStatus(
    result.status,
    result
  )

  result.selectedComment = selectedComment

  return result
}
