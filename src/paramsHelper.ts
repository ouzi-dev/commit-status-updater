const SUCCESS = 'success'
const ERROR = 'error'
const FAILURE = 'failure'
const PENDING = 'pending'
const CANCELLED = 'cancelled'

type Status = 'error' | 'failure' | 'pending' | 'success'

export interface IParams {
  token: string
  url: string
  description: string
  name: string
  status: Status
  singleShot: boolean
  ignoreForks: boolean
  addHoldComment: boolean
  startComment: string
  endComment: string
}

export function getStatusForCommitStatus(str: string): Status {
  const toLower = str.toLowerCase()
  switch (toLower) {
    case ERROR: {
      return ERROR
    }
    case FAILURE: {
      return FAILURE
    }
    case PENDING: {
      return PENDING
    }
    case SUCCESS: {
      return SUCCESS
    }
    default: {
      throw new TypeError(`unknown commit status: ${str}`)
    }
  }
}

export function getStatusForJobStatus(str: string, isPost: boolean): Status {
  const toLower = str.toLowerCase()
  switch (toLower) {
    case SUCCESS: {
      if (isPost) {
        return SUCCESS
      } else {
        return PENDING
      }
    }
    case FAILURE: {
      return FAILURE
    }
    case CANCELLED: {
      return FAILURE
    }
    default: {
      throw new TypeError(`unknown job status: ${str}`)
    }
  }
}
