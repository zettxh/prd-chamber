// Shared utilities for async operations

// Mutex: serialize async operations per project to prevent race conditions
const mutexes = new Map<string, Promise<void>>()

export async function withMutex<T>(key: string, fn: () => T): Promise<T> {
  const previous = mutexes.get(key) ?? Promise.resolve()
  let release: () => void = () => {}
  const next = new Promise<void>(res => { release = res })
  mutexes.set(key, next)
  try {
    return await previous.then(fn)
  } finally {
    release()
    mutexes.delete(key)
  }
}
