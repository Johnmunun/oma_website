import { describe, expect, it } from 'vitest'
import { isRbacSchemaMissingError } from '../schema'

describe('isRbacSchemaMissingError', () => {
  it('detects Prisma P2021 table missing', () => {
    expect(
      isRbacSchemaMissingError({
        code: 'P2021',
        message: 'The table `public.StructureMembership` does not exist',
      })
    ).toBe(true)
  })

  it('detects Prisma P2022 column missing', () => {
    expect(isRbacSchemaMissingError({ code: 'P2022' })).toBe(true)
  })

  it('ignores unrelated errors', () => {
    expect(isRbacSchemaMissingError({ code: 'P2002' })).toBe(false)
    expect(isRbacSchemaMissingError(new Error('timeout'))).toBe(false)
  })
})
