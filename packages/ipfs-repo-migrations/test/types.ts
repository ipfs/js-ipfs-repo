import type { Backends } from '../src/types'
import type { Level } from 'level'

export interface SetupOptions {
  dir?: string
  prefix?: string
  createBackends?: CreateBackendsOptions
}

export interface CreateBackendsOptions {
  createLevel?: (path: string) => string | Level<string, Uint8Array>
}

export interface SetupFunction { (opts?: SetupOptions): Promise<{ dir: string, prefix: string, backends: Backends}> }
export interface CleanupFunction { (dir: string): Promise<void> }

export interface CreateBackends {
  (prefix: string, opts?: CreateBackendsOptions): Backends
}
