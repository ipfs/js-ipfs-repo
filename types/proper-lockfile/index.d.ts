declare function lock (file: string, options?: Options): Promise<release>
declare function check (file: string, options?: Options): Promise<boolean>

interface Options {
  /**
   * Duration in milliseconds in which the lock is considered stale, defaults to 10000 (minimum value is 5000)
   */
  stale?: number
  /**
   * The interval in milliseconds in which the lockfile's mtime will be updated, defaults to stale/2 (minimum value is 1000, maximum value is stale/2)
   */
  update?: number
  /**
   * The number of retries or a retry options object, defaults to 0
   */
  retries?: number
  /**
   * Resolve symlinks using realpath, defaults to true (note that if true, the file must exist previously)
   */
  realpath?: boolean
  /**
   * Called if the lock gets compromised, defaults to a function that simply throws the error which will probably cause the process to die
   */
  onCompromised?: (err) => void
  /**
   * Custom lockfile path. e.g.: If you want to lock a directory and create the lock file inside it, you can pass file as <dir path> and options.lockfilePath as <dir path>/dir.lock
   */
  lockfilePath?: string
}

declare function release (): Promise<void>

export {
  check,
  lock,
  release,
  Options
}
