import * as github from '@actions/github'

export function validateEventType(): void {
  if (github.context.eventName !== 'pull_request') {
    throw new Error('Error, action only works for pull_request events!')
  }
}
