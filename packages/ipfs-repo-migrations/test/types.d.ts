import { Backends } from '../src/types'

export interface SetupFunction { (prefix?: string): Promise<{ dir: string, backends: Backends}> }
export interface CleanupFunction { (dir: string): Promise<void> }
