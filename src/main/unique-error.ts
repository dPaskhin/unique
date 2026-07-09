export class UniqueError extends Error {
  constructor(
    code: string,
    size: number,
    duration: number,
    iterations: number
  ) {
    super(
      `${code} - store size: ${size}, retried: ${iterations}, duration: ${duration}ms`
    );
    this.name = 'UniqueError';
  }
}
