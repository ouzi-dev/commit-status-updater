import * as assert from 'assert'
import {IParams} from '../lib/paramsHelper'

// Late bind
let inputsHelper: any

// Mock @actions/core
let inputs = {} as any
const mockCore = jest.genMockFromModule('@actions/core') as any
mockCore.getInput = (name: string) => {
  return inputs[name]
}

describe('inputsHelper tests', () => {
  beforeAll(() => {
    // Mocks
    jest.setMock('@actions/core', mockCore)

    // Now import
    inputsHelper = require('../lib/inputsHelper')
  })

  beforeEach(() => {
    // Reset inputs
    inputs = {}
  })

  afterAll(() => {
    // Reset modules
    jest.resetModules()
  })

  it('requires token', () => {
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /token can't be an empty string/)
  })

  it('requires name', () => {
    inputs.token = '1234567abcdefg'
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /name can't be an empty string/)
  })

  it('requires status', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /status can't be an empty string/)
  })

  it('requires valid job status on singleShot false', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'bleh'
    inputs.singleShot = 'false'
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /TypeError: unknown job status: bleh/)
  })

  it('requires valid job status on singleShot not provided', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'bleh'
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /TypeError: unknown job status: bleh/)
  })

  it('requires valid commit status on singleShot true', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'bleh'
    inputs.singleShot = 'true'
    assert.throws(() => {
      inputsHelper.getInputs(false)
    }, /TypeError: unknown commit status: bleh/)
  })

  it('sets correct default values', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'Success'
    const params: IParams = inputsHelper.getInputs(false)
    expect(params).toBeTruthy()
    expect(params.name).toBe('my_name')
    expect(params.token).toBe('1234567abcdefg')
    expect(params.url).toBe('')
    expect(params.description).toBe('')
    expect(params.status).toBe('pending')
    expect(params.startComment).toBe('')
    expect(params.endComment).toBe('')
    expect(params.addHoldComment).toBeFalsy()
    expect(params.singleShot).toBeFalsy()
    expect(params.ignoreForks).toBeTruthy()
  })

  it('sets pending status when no isPost, no singleShot and success status', () => {
    const isPost = false
    inputs.singleShot = 'false'
    inputs.status = 'Success'
    inputs.token = 'my_token'
    inputs.url = 'my_url'
    inputs.description = 'my_description'
    inputs.name = 'my_name'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.startComment = '/hold'
    inputs.endComment = '/hold cancel'

    const params: IParams = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.url).toBe('my_url')
    expect(params.description).toBe('my_description')
    expect(params.name).toBe('my_name')
    expect(params.status).toBe('pending')
    expect(params.startComment).toBe('/hold')
    expect(params.endComment).toBe('/hold cancel')
    expect(params.addHoldComment).toBeFalsy()
    expect(params.singleShot).toBeFalsy()
    expect(params.ignoreForks).toBeTruthy()
  })

  it('sets success status when isPost, no singleShot and success status', () => {
    const isPost = true
    inputs.singleShot = 'false'
    inputs.status = 'Success'
    inputs.token = 'my_token'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.ignoreForks = 'false'
    inputs.addHoldComment = 'true'
    inputs.startComment = '/hold'
    inputs.endComment = '/hold cancel'

    const params: IParams = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.url).toBe('')
    expect(params.description).toBe('')
    expect(params.name).toBe('my_name')
    expect(params.status).toBe('success')
    expect(params.startComment).toBe('/hold')
    expect(params.endComment).toBe('/hold cancel')
    expect(params.addHoldComment).toBeTruthy()
    expect(params.singleShot).toBeFalsy()
    expect(params.ignoreForks).toBeFalsy()
  })

  it('sets correct status for no singleShot and valid job status', () => {
    let isPost = true
    inputs.singleShot = 'false'
    inputs.token = 'my_token'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.status = 'Success'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.startComment = '/hold'
    inputs.endComment = '/hold cancel'

    let params: IParams = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('success')

    isPost = false
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('pending')

    inputs.status = 'failure'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')

    inputs.status = 'cancelled'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')

    isPost = true
    inputs.status = 'failure'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')

    inputs.status = 'cancelled'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
  })

  it('sets correct status for singleShot and valid commit status', () => {
    const isPost = false
    inputs.singleShot = 'true'
    inputs.token = 'my_token'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.status = 'Success'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.startComment = '/hold'
    inputs.endComment = '/hold cancel'

    let params: IParams = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('success')

    inputs.status = 'error'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('error')

    inputs.status = 'pending'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('pending')

    inputs.status = 'failure'
    params = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
  })
})
