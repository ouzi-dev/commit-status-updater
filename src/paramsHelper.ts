const SUCCESS = 'success'
const ERROR = 'error'
const FAILURE = 'failure'
const PENDING = 'pending'
const CANCELLED = 'cancelled'

type Status = 'error' | 'failure' | 'pending' | 'success'

export interface IParams {
  token: string
  sha: string
  url: string
  description: string
  name: string
  status: Status
  ignoreForks: boolean
  addHoldComment: boolean
  pendingComment: string
  successComment: string
  failComment: string
  selectedComment: string
}

export async function getMessageForStatus(
  status: Status,
  params: IParams
): Promise<string> {
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

export async function getStatus(str: string): Promise<Status> {
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
