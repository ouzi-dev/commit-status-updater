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
  pendingComment: string
  successComment: string
  failComment: string
  selectedComment: string
}

export function getMessageForStatus(status: Status, params: IParams): string {
  switch (status) {
    case PENDING: {
      return params.pendingComment
    }
    case SUCCESS: {
      return params.successComment
    }
    default: {
      return params.failComment
    }
  }
}

export function getStatusForSingleShot(str: string): Status {
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
    case CANCELLED: {
      return FAILURE
    }
    default: {
      throw new TypeError(`unknown commit or job status: ${str}`)
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
