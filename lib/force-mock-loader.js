// Emergency loader: when FORCE_MOCK_SUPABASE=1, monkey-patch require() to
// return a harmless mock for Supabase client factories so any direct
// createClient() usage won't touch production data during build or scripts.
// This file is intended as a temporary safety net.

if (process.env.FORCE_MOCK_SUPABASE) {
  try {
    const Module = require('module')
    const originalRequire = Module.prototype.require

    function makeMockSupabase() {
      const noop = () => ({ data: null, error: null })
      return {
        from: () => ({ select: noop, insert: noop, update: noop, delete: noop, eq: noop, single: noop, range: noop, limit: noop, order: noop, rpc: noop }),
        rpc: noop,
        auth: { getUser: async () => null, signIn: async () => ({ data: null, error: null }) },
      }
    }

    Module.prototype.require = function patchedRequire(request) {
      // If someone requires the Supabase packages, return a wrapped module
      // that keeps other exports intact but forces createClient/createServerClient
      // /createBrowserClient to return the mock.
      if (request === '@supabase/supabase-js' || request === '@supabase/ssr') {
        const orig = originalRequire.apply(this, arguments)
        const mock = makeMockSupabase()

        // Wrap known factory names safely
        const wrapped = { ...orig }
        if (typeof orig.createClient === 'function') {
          wrapped.createClient = (..._a) => mock
        }
        if (typeof orig.createBrowserClient === 'function') {
          wrapped.createBrowserClient = (..._a) => mock
        }
        if (typeof orig.createServerClient === 'function') {
          wrapped.createServerClient = (..._a) => mock
        }

        return wrapped
      }

      return originalRequire.apply(this, arguments)
    }
  } catch (err) {
    // If this fails, don't crash the build; just continue without the hook.
    // We avoid throwing so the build can still proceed (and env guard still works
    // for modules that check FORCE_MOCK directly).
    // eslint-disable-next-line no-console
    console.error('[force-mock-loader] failed to install require hook:', err)
  }
}
