import { requireAdmin } from '../../lib/auth/getUser'
import { createClient } from '../../lib/supabase/server'

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

describe('requireAdmin', () => {
  const getSession = jest.fn()

  beforeEach(() => {
    getSession.mockReset()
    ;(createClient as jest.Mock).mockReturnValue({ auth: { getSession } })
  })

  it('returns admin user when session is valid', async () => {
    getSession.mockResolvedValue({
      data: {
        session: {
          user: {
            id: '1',
            email: 'admin@example.com',
            app_metadata: { role: 'admin' },
          },
        },
      },
      error: null,
    })

    await expect(requireAdmin()).resolves.toEqual({
      id: '1',
      email: 'admin@example.com',
    })
  })

  it('throws error when session is invalid', async () => {
    getSession.mockResolvedValue({ data: { session: null }, error: null })

    await expect(requireAdmin()).rejects.toThrow('Unauthorized')
  })
})
