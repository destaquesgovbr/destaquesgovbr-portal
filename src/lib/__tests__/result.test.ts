import { describe, expect, it } from 'vitest'
import { Result, ResultError, withResult } from '../result'

describe('Result', () => {
  describe('Result.ok', () => {
    it('creates success result with data', () => {
      const result = Result.ok({ value: 42 })

      expect(result.type).toBe('ok')
      expect(result.data).toEqual({ value: 42 })
      expect(result.error).toBeUndefined()
    })

    it('creates success result with null data', () => {
      const result = Result.ok(null)

      expect(result.type).toBe('ok')
      expect(result.data).toBeNull()
    })

    it('creates success result with array data', () => {
      const result = Result.ok([1, 2, 3])

      expect(result.type).toBe('ok')
      expect(result.data).toEqual([1, 2, 3])
    })
  })

  describe('Result.err', () => {
    it('creates error result with string message', () => {
      const result = Result.err('Something went wrong')

      expect(result.type).toBe('err')
      expect(result.error).toBe('Something went wrong')
      expect(result.data).toBeUndefined()
    })

    it('creates error result with object', () => {
      const error = { code: 404, message: 'Not found' }
      const result = Result.err(error)

      expect(result.type).toBe('err')
      expect(result.error).toEqual(error)
    })
  })

  describe('Result.unknownErr', () => {
    it('creates unknown error result with Error instance', () => {
      const error = new Error('Unexpected error')
      const result = Result.unknownErr(error)

      expect(result.type).toBe('unknown_err')
      expect(result.error).toBe(error)
      expect(result.data).toBeUndefined()
    })

    it('creates unknown error result with unknown value', () => {
      const result = Result.unknownErr('some string error')

      expect(result.type).toBe('unknown_err')
      expect(result.error).toBe('some string error')
    })
  })
})

describe('ResultError', () => {
  it('extends Error class', () => {
    const error = new ResultError('custom content')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ResultError)
  })

  it('stores content', () => {
    const content = { code: 'VALIDATION_ERROR', field: 'email' }
    const error = new ResultError(content)

    expect(error.content).toEqual(content)
  })

  it('has message "ResultError"', () => {
    const error = new ResultError('any content')

    expect(error.message).toBe('ResultError')
  })
})

describe('withResult', () => {
  it('wraps successful async function in ok result', async () => {
    const fn = async (x: number) => x * 2
    const wrapped = withResult(fn)

    const result = await wrapped(5)

    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.data).toBe(10)
    }
  })

  it('wraps successful async function with no args', async () => {
    const fn = async () => 'hello'
    const wrapped = withResult(fn)

    const result = await wrapped()

    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.data).toBe('hello')
    }
  })

  it('wraps successful async function with multiple args', async () => {
    const fn = async (a: number, b: number, c: number) => a + b + c
    const wrapped = withResult(fn)

    const result = await wrapped(1, 2, 3)

    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.data).toBe(6)
    }
  })

  it('wraps thrown ResultError in err result', async () => {
    const fn = async () => {
      throw new ResultError('Custom error')
    }
    const wrapped = withResult(fn)

    const result = await wrapped()

    expect(result.type).toBe('err')
    if (result.type === 'err') {
      expect(result.error).toBe('Custom error')
    }
  })

  it('wraps thrown ResultError with object content', async () => {
    const errorContent = { code: 'NOT_FOUND', id: 123 }
    const fn = async () => {
      throw new ResultError(errorContent)
    }
    const wrapped = withResult(fn)

    const result = await wrapped()

    expect(result.type).toBe('err')
    if (result.type === 'err') {
      expect(result.error).toEqual(errorContent)
    }
  })

  it('wraps unknown errors in unknown_err result', async () => {
    const fn = async () => {
      throw new Error('Unexpected')
    }
    const wrapped = withResult(fn)

    const result = await wrapped()

    expect(result.type).toBe('unknown_err')
    if (result.type === 'unknown_err') {
      expect(result.error).toBeInstanceOf(Error)
    }
  })

  it('wraps non-Error throws in unknown_err result', async () => {
    const fn = async () => {
      throw 'string error'
    }
    const wrapped = withResult(fn)

    const result = await wrapped()

    expect(result.type).toBe('unknown_err')
    if (result.type === 'unknown_err') {
      expect(result.error).toBe('string error')
    }
  })

  it('preserves function context with args', async () => {
    const fn = async (prefix: string, items: string[]) =>
      items.map((i) => `${prefix}-${i}`)
    const wrapped = withResult(fn)

    const result = await wrapped('item', ['a', 'b', 'c'])

    expect(result.type).toBe('ok')
    if (result.type === 'ok') {
      expect(result.data).toEqual(['item-a', 'item-b', 'item-c'])
    }
  })
})
