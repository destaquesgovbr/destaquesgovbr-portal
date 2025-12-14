export enum ActionStateEnum {
  Idle = 'idle',
  Success = 'success',
  Error = 'error',
  UnprocessedError = 'unprocessed_error',
}

export type Action = (
  _: ActionState,
  formData: FormData,
) => Promise<ActionState>

export type ActionState<E = unknown> =
  | {
      state: ActionStateEnum.Idle | ActionStateEnum.Success
      error?: never
    }
  | {
      state: ActionStateEnum.Error
      error: E
    }
  | {
      state: ActionStateEnum.UnprocessedError
      error: unknown
    }

export namespace ActionState {
  export function idle(): ActionState {
    return {
      state: ActionStateEnum.Idle,
    }
  }

  export function success(): ActionState {
    return {
      state: ActionStateEnum.Success,
    }
  }

  export function error<E>(error: E): ActionState<E> {
    return {
      state: ActionStateEnum.Error,
      error,
    }
  }

  export function unprocessedError(error: unknown): ActionState {
    return {
      state: ActionStateEnum.UnprocessedError,
      error,
    }
  }
}

export class ActionError<T> extends Error {
  constructor(public content: T) {
    super('ActionError')
  }
}

/**
 * @param handler Void function that might throw ActionError, which will be caught and returned as ActionState
 * @returns
 */
export function withActionState<E, P extends unknown[] = unknown[]>(
  handler: (...params: P) => Promise<void>,
): (previousState: ActionState<E>, ...params: P) => Promise<ActionState<E>> {
  return async (_previousState: ActionState<E>, ...params: P) => {
    try {
      await handler(...params)
      return ActionState.success()
    } catch (e) {
      if (e instanceof ActionError) return ActionState.error(e.content)
      console.error('Uncaught error on action state management:')
      console.error((e as Error).message)
      return ActionState.unprocessedError(e)
    }
  }
}
