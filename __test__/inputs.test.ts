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

  it('requires token', async () => {
    expect.assertions(1)
    await expect(inputsHelper.getInputs()).rejects.toEqual(
      TypeError("token can't be an empty string")
    )
  })

  it('requires sha', async () => {
    expect.assertions(1)

    inputs.token = '1234567abcdefg'

    await expect(inputsHelper.getInputs()).rejects.toEqual(
      TypeError("sha can't be an empty string")
    )
  })

  it('requires name', async () => {
    expect.assertions(1)

    inputs.token = '1234567abcdefg'
    inputs.sha = 'abcdefg1234567'

    await expect(inputsHelper.getInputs()).rejects.toEqual(
      TypeError("name can't be an empty string")
    )
  })

  it('requires status', async () => {
    expect.assertions(1)

    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.sha = 'abcdefg1234567'

    await expect(inputsHelper.getInputs()).rejects.toEqual(
      TypeError("status can't be an empty string")
    )
  })

  it('requires valid commit status', async () => {
    expect.assertions(1)

    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.sha = 'abcdefg1234567'
    inputs.status = 'bleh'

    await expect(inputsHelper.getInputs()).rejects.toEqual(
      TypeError('unknown commit or job status: bleh')
    )
  })

  it('sets correct default values', async () => {
    inputs.name = 'my_name'
    inputs.token = '1234567abcdefg'
    inputs.sha = 'abcdefg1234567'
    inputs.status = 'Success'

    const params: IParams = await inputsHelper.getInputs()

    expect(params).toBeTruthy()
    expect(params.name).toBe('my_name')
    expect(params.token).toBe('1234567abcdefg')
    expect(params.sha).toBe('abcdefg1234567')
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

  it('sets success status', async () => {
    inputs.singleShot = 'false'
    inputs.status = 'Success'
    inputs.token = 'my_token'
    inputs.sha = 'abcdefg1234567'
    inputs.url = 'my_url'
    inputs.description = 'my_description'
    inputs.name = 'my_name'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    const params: IParams = await inputsHelper.getInputs()

    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.sha).toBe('abcdefg1234567')
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

  it('sets pending status', async () => {
    inputs.singleShot = 'false'
    inputs.status = 'Pending'
    inputs.token = 'my_token'
    inputs.sha = 'abcdefg1234567'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.ignoreForks = 'false'
    inputs.addHoldComment = 'true'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    const params: IParams = await inputsHelper.getInputs()

    expect(params).toBeTruthy()
    expect(params.token).toBe('my_token')
    expect(params.sha).toBe('abcdefg1234567')
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

  it('sets correct status and comment', async () => {
    inputs.singleShot = 'false'
    inputs.token = 'my_token'
    inputs.sha = 'abcdefg1234567'
    inputs.url = ''
    inputs.description = ''
    inputs.name = 'my_name'
    inputs.status = 'Success'
    inputs.ignoreForks = 'true'
    inputs.addHoldComment = 'false'
    inputs.pendingComment = '/hold'
    inputs.successComment = '/hold cancel'
    inputs.failComment = '/hold fail'

    let params: IParams = await inputsHelper.getInputs()

    expect(params).toBeTruthy()
    expect(params.status).toBe('success')
    expect(params.selectedComment).toBe('/hold cancel')

    inputs.status = 'pending'
    params = await inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('pending')
    expect(params.selectedComment).toBe('/hold')

    inputs.status = 'failure'
    params = await inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
    expect(params.selectedComment).toBe('/hold fail')

    inputs.status = 'cancelled'
    params = await inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('failure')
    expect(params.selectedComment).toBe('/hold fail')

    inputs.status = 'error'
    params = await inputsHelper.getInputs()
    expect(params).toBeTruthy()
    expect(params.status).toBe('error')
    expect(params.selectedComment).toBe('/hold fail')
  })
})
