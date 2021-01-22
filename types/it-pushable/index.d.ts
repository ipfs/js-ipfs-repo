export interface Pushable<T> extends AsyncIterable<T> {
  push: (value: T) => this
  end: (err?: Error) => this
}

export interface PushableV<T> extends AsyncIterable<T[]> {
  push: (value: T) => this
  end: (err?: Error) => this
}

interface Options {
  onEnd?: (err?: Error) => void
  writev?: false
}

interface OptionsV {
  onEnd?: (err?: Error) => void
  writev: true
}

declare function pushable<T> (options?: Options): Pushable<T>
declare function pushable<T> (options: OptionsV): PushableV<T>

export = pushable
