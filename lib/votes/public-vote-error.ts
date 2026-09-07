export class PublicVoteError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message)
    this.name = 'PublicVoteError'
  }
}
