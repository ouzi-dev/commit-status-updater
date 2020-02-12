import * as assert from 'assert'
import {IGithubHelper} from '../lib/githubHelper'
import {IParams} from '../lib/paramsHelper'

let runner: any

const mockUtils = jest.genMockFromModule('../lib/utils') as any

const mockInputsHelper = jest.genMockFromModule('../lib/inputsHelper') as any

const mockGithubHelper = jest.genMockFromModule('../lib/githubHelper') as any
mockGithubHelper.getInputs = jest.fn()

const MockIGithubHelper = jest.fn<IGithubHelper, []>(() => ({
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

  it('run sets status and comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    runner.run()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledWith('my comment')
  })

  it('run sets status and no comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    runner.run()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('run does not set status or comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(true)
    runner.run()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('run sets status if ignore fork false', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = false
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    runner.run()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.isFork).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
  })

  it('post singleShot do not add status or comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.singleShot = true
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('post adds status and comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.singleShot = false
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledWith('my comment')
  })

  it('post adds status and no comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.singleShot = false
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(false)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('post does not add status or comment in fork', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.singleShot = false
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(true)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })

  it('post does not add status in fork but adds comment', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = true
    params.singleShot = false
    params.addHoldComment = true
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    mockIGithubHelper.isFork.mockReturnValue(true)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledWith('my comment')
  })

  it('post adds status if ignore fork false', () => {
    const params = ({} as unknown) as IParams
    params.token = 'bleh'
    params.ignoreForks = false
    params.singleShot = false
    params.addHoldComment = false
    params.selectedComment = 'my comment'
    mockInputsHelper.getInputs.mockReturnValue(params)
    mockGithubHelper.CreateGithubHelper.mockReturnValue(mockIGithubHelper)
    runner.post()
    expect(mockUtils.validateEventType).toHaveBeenCalled()
    expect(mockIGithubHelper.isFork).toHaveBeenCalledTimes(0)
    expect(mockIGithubHelper.setStatus).toHaveBeenCalledWith(params)
    expect(mockIGithubHelper.addComment).toHaveBeenCalledTimes(0)
  })
})
