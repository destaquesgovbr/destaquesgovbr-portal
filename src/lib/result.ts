export type Result<T, E> =
  | {
      type: 'ok'
      data: T
      error?: never
    }
  | {
      type: 'err'
      data?: never
      error: E
    }
  | {
      type: 'unknown_err'
      data?: never
      error: unknown
    }

export namespace Result {
  export function ok<T>(data: T): Result<T, never> {
    return {
      type: 'ok',
      data,
    }
  }

  export function err<E>(error: E): Result<never, E> {
    return {
      type: 'err',
      error,
    }
  }

  export function unknownErr(error: unknown): Result<never, unknown> {
    return {
      type: 'unknown_err',
      error,
    }
  }
}

export class ResultError<T> extends Error {
  constructor(public content: T) {
    super('ResultError')
  }
}

export function withResult<T, E, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  _phantom?: E,
): (...args: Args) => Promise<Result<T, E>> {
  return async (...args: Args) => {
    try {
      const data = await fn(...args)
      return Result.ok(data)
    } catch (error) {
      if (error instanceof ResultError) return Result.err(error.content)
      return Result.unknownErr(error)
    }
  }
}
