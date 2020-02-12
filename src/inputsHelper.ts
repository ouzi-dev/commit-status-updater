import * as core from '@actions/core'
import * as paramsHelper from './paramsHelper'

const SINGLE_SHOT_PARAM = 'singleShot'
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

function isEmptyString(str: string): boolean {
  return !str || str.length === 0
}

function validateString(str: string, paramName: string): void {
  if (isEmptyString(str)) {
    throw new TypeError(`${paramName} can't be an empty string`)
  }
}

export function getInputs(isPost: boolean): paramsHelper.IParams {
  const result = ({} as unknown) as paramsHelper.IParams

  result.token = core.getInput(TOKEN_PARAM)

  validateString(result.token, TOKEN_PARAM)

  result.name = core.getInput(NAME_PARAM)

  validateString(result.name, NAME_PARAM)

  const singleShot = core.getInput(SINGLE_SHOT_PARAM)

  if (isEmptyString(singleShot)) {
    result.singleShot = false
  } else {
    result.singleShot = singleShot.toLowerCase() === 'true'
  }

  const status = core.getInput(STATUS_PARAM)

  validateString(status, STATUS_PARAM)

  if (result.singleShot) {
    result.status = paramsHelper.getStatusForSingleShot(status)
  } else {
    result.status = paramsHelper.getStatusForJobStatus(status, isPost)
  }

  result.url = core.getInput(URL_PARAM) || ''
  result.description = core.getInput(DESCRIPTION_PARAM) || ''

  const ignoreForks = core.getInput(IGNORE_FORKS_PARAM)

  if (isEmptyString(ignoreForks)) {
    result.ignoreForks = true
  } else {
    result.ignoreForks = !(ignoreForks.toLowerCase() === 'false')
  }

  const addHoldComment = core.getInput(ADD_HOLD_COMMENT_PARAM)

  if (isEmptyString(addHoldComment)) {
    result.addHoldComment = false
  } else {
    result.addHoldComment = addHoldComment.toLowerCase() === 'true'
  }

  result.pendingComment = core.getInput(PENDING_COMMENT_PARAM) || ''
  result.successComment = core.getInput(SUCCESS_COMMENT_PARAM) || ''
  result.failComment = core.getInput(FAIL_COMMENT_PARAM) || ''

  const selectedComment = paramsHelper.getMessageForStatus(
    result.status,
    result
  )
  result.selectedComment = selectedComment

  return result
}
