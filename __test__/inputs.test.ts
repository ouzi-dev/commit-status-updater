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
      inputsHelper.getInputs()
    }, /token can't be an empty string/)
  })

  it('requires name', () => {
    inputs.token = '1234567abcdefg'
    assert.throws(() => {
      inputsHelper.getInputs()
    }, /name can't be an empty string/)
  })

  it('requires status', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    assert.throws(() => {
      inputsHelper.getInputs()
    }, /status can't be an empty string/)
  })

  it('requires valid commit status', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'bleh'
    assert.throws(() => {
      inputsHelper.getInputs()
    }, /TypeError: unknown commit or job status: bleh/)
  })

  it('sets correct default values', () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.status = 'Success'
    const params: IParams = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.name).toBe('my_name')
    expect(params.token).toBe('1234567abcdefg')
    expect(params.url).toBe('')
    expect(params.description).toBe('')
    expect(params.status).toBe('success')
    expect(params.pendingComment).toBe('')
    expect(params.successComment).toBe('')
    expect(params.failComment).toBe('')
    expect(params.selectedComment).toBe('')
    expect(params.addHoldComment).toBeFalsy()
    expect(params.ignoreForks).toBeTruthy()
  })

  it('sets success status', () => {
    inputs.singleShot = 'false'
    inputs.status = 'Success'
    inputs.token = 'my_token'
    inputs.url = 'my_url'
    inputs.description = 'my_description'
    inputs.name = 'my_name'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    const params: IParams = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.url).toBe('my_url')
    expect(params.description).toBe('my_description')
    expect(params.name).toBe('my_name')
    expect(params.status).toBe('success')
    expect(params.pendingComment).toBe('/hold')
    expect(params.successComment).toBe('/hold cancel')
    expect(params.failComment).toBe('/hold fail')
    expect(params.selectedComment).toBe('/hold cancel')
    expect(params.addHoldComment).toBeFalsy()
    expect(params.ignoreForks).toBeTruthy()
  })

  it('sets pending status', () => {
    const isPost = true
    inputs.singleShot = 'false'
    inputs.status = 'Pending'
    inputs.token = 'my_token'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.ignoreForks = 'false'
    inputs.addHoldComment = 'true'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    const params: IParams = inputsHelper.getInputs(isPost)
    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.url).toBe('')
    expect(params.description).toBe('')
    expect(params.name).toBe('my_name')
    expect(params.status).toBe('pending')
    expect(params.pendingComment).toBe('/hold')
    expect(params.successComment).toBe('/hold cancel')
    expect(params.failComment).toBe('/hold fail')
    expect(params.selectedComment).toBe('/hold')
    expect(params.addHoldComment).toBeTruthy()
    expect(params.ignoreForks).toBeFalsy()
  })

  it('sets correct status and comment', () => {
    inputs.singleShot = 'false'
    inputs.token = 'my_token'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.status = 'Success'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    let params: IParams = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('success')
    expect(params.selectedComment).toBe('/hold cancel')

    inputs.status = 'pending'
    params = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('pending')
    expect(params.selectedComment).toBe('/hold')

    inputs.status = 'failure'
    params = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
    expect(params.selectedComment).toBe('/hold fail')

    inputs.status = 'cancelled'
    params = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
    expect(params.selectedComment).toBe('/hold fail')

    inputs.status = 'error'
    params = inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('error')
    expect(params.selectedComment).toBe('/hold fail')
  })
})
