import * as assert from 'assert'
import {IGithubHelper} from '../lib/githubHelper'
import {IParams} from '../lib/paramsHelper'

let runner: any

const mockUtils = jest.genMockFromModule('../lib/utils') as any

const mockInputsHelper = jest.genMockFromModule('../lib/inputsHelper') as any

const mockGithubHelper = jest.genMockFromModule('../lib/githubHelper') as any
mockGithubHelper.getInputs = jest.fn()

const MockIGithubHelper = jest.fn<IGithubHelper, []>(() => ({
  isPullRequest: jest.fn(),
  isFork: jest.fn(),
  setStatus: jest.fn(),
  addComment: jest.fn()
}))
let mockIGithubHelper: any

describe('runner tests', () => {
  beforeAll(() => {
    jest.setMock('../lib/utils', mockUtils)
    jest.setMock('../lib/inputsHelper', mockInputsHelper)
    jest.setMock('../lib/githubHelper', mockGithubHelper)

    mockIGithubHelper = new MockIGithubHelper()

    runner = require('../lib/runner')
  })

  beforeEach(() => {})

  afterAll(() => {
    jest.resetModules()
  })

  it('on push run sets status', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    mockIGithubHelper.isPullRequest.mockReturnValue(false)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('on PR run sets status and comment', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    mockIGithubHelper.isPullRequest.mockReturnValue(true)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledWith('my comment')
  })

  it('on PR run sets status and no comment', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    mockIGithubHelper.isPullRequest.mockReturnValue(true)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('on PR run does not set status or comment', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(true)
    mockIGithubHelper.isPullRequest.mockReturnValue(true)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('on PR run does not set status or comment when it is a fork and add comment enabled', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(true)
    mockIGithubHelper.isPullRequest.mockReturnValue(true)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('on PR run sets status if ignore fork false', async () => {
    const params = {} as unknown as IParams
    params.token = 'bleh'
    params.ignoreForks = false
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isPullRequest.mockReturnValue(true)

    await runner.run()

    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.isFork).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
  })
})
