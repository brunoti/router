import React, { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import {
  type RouterHistory,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '../src'

afterEach(() => {
  vi.resetAllMocks()
  window.history.replaceState(null, 'root', '/')
  cleanup()
})

const mockFn1 = vi.fn()

function createTestRouter(initialHistory?: RouterHistory) {
  let history

  if (initialHistory) {
    history = initialHistory
  }

  const rootRoute = createRootRoute({})
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/' })
  const postsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/posts',
  })
  const postIdRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '/$slug',
  })
  const topLevelSplatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '$',
  })
  // This is simulates a user creating a `é.tsx` file using file-based routing
  const pathSegmentEAccentRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/path-segment/é',
  })
  // This is simulates a user creating a `🚀.tsx` file using file-based routing
  const pathSegmentRocketEmojiRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/path-segment/🚀',
  })

  const routeTree = rootRoute.addChildren([
    indexRoute,
    postsRoute.addChildren([postIdRoute]),
    pathSegmentEAccentRoute,
    pathSegmentRocketEmojiRoute,
    topLevelSplatRoute,
  ])

  const router = createRouter({ routeTree, history })

  return {
    router,
    routes: {
      indexRoute,
      postsRoute,
      postIdRoute,
      topLevelSplatRoute,
      pathSegmentEAccentRoute,
      pathSegmentRocketEmojiRoute,
    },
  }
}

describe('encoding: URL param segment for /posts/$slug', () => {
  it('state.location.pathname, should have the params.slug value of "tanner"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/tanner'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/posts/tanner')
  })

  it('state.location.pathname, should have the params.slug value of "🚀"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/🚀'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/posts/🚀')
  })

  it('state.location.pathname, should have the params.slug value of "%F0%9F%9A%80"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/%F0%9F%9A%80'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/posts/%F0%9F%9A%80')
  })

  it('state.location.pathname, should have the params.slug value of "framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({
        initialEntries: [
          '/posts/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
        ],
      }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe(
      '/posts/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
    )
  })

  it('params.slug for the matched route, should be "tanner"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/tanner'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.postIdRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any).slug).toBe('tanner')
  })

  it('params.slug for the matched route, should be "🚀"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/🚀'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.postIdRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any).slug).toBe('🚀')
  })

  it('params.slug for the matched route, should be "🚀" instead of it being "%F0%9F%9A%80"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/posts/%F0%9F%9A%80'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.postIdRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any).slug).toBe('🚀')
  })

  it('params.slug for the matched route, should be "framework/react/guide/file-based-routing tanstack" instead of it being "framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({
        initialEntries: [
          '/posts/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
        ],
      }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.postIdRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any).slug).toBe(
      'framework/react/guide/file-based-routing tanstack',
    )
  })
})

describe('encoding: URL splat segment for /$', () => {
  it('state.location.pathname, should have the params._splat value of "tanner"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/tanner'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/tanner')
  })

  it('state.location.pathname, should have the params._splat value of "🚀"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/🚀'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/🚀')
  })

  it('state.location.pathname, should have the params._splat value of "%F0%9F%9A%80"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/%F0%9F%9A%80'] }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe('/%F0%9F%9A%80')
  })

  it('state.location.pathname, should have the params._splat value of "framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({
        initialEntries: [
          '/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
        ],
      }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe(
      '/framework%2Freact%2Fguide%2Ffile-based-routing%20tanstack',
    )
  })

  it('state.location.pathname, should have the params._splat value of "framework/react/guide/file-based-routing tanstack"', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({
        initialEntries: ['/framework/react/guide/file-based-routing tanstack'],
      }),
    )

    await act(() => router.load())

    expect(router.state.location.pathname).toBe(
      '/framework/react/guide/file-based-routing tanstack',
    )
  })

  it('params._splat for the matched route, should be "tanner"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/tanner'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.topLevelSplatRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any)._splat).toBe('tanner')
  })

  it('params._splat for the matched route, should be "🚀"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/🚀'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.topLevelSplatRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any)._splat).toBe('🚀')
  })

  it('params._splat for the matched route, should be "🚀" instead of it being "%F0%9F%9A%80"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/%F0%9F%9A%80'] }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.topLevelSplatRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any)._splat).toBe('🚀')
  })

  it('params._splat for the matched route, should be "framework/react/guide/file-based-routing tanstack"', async () => {
    const { router, routes } = createTestRouter(
      createMemoryHistory({
        initialEntries: ['/framework/react/guide/file-based-routing tanstack'],
      }),
    )

    await act(() => router.load())

    const match = router.state.matches.find(
      (r) => r.routeId === routes.topLevelSplatRoute.id,
    )

    if (!match) {
      throw new Error('No match found')
    }

    expect((match.params as unknown as any)._splat).toBe(
      'framework/react/guide/file-based-routing tanstack',
    )
  })
})

describe('encoding: URL path segment', () => {
  // TODO: Find out why this wasn't working with createMemoryHistory
  it.each([
    {
      input: '/path-segment/%C3%A9',
      output: '/path-segment/é',
      type: 'encoded',
    },
    {
      input: '/path-segment/é',
      output: '/path-segment/é',
      type: 'not encoded',
    },
    {
      input: '/path-segment/%F0%9F%9A%80',
      output: '/path-segment/🚀',
      type: 'encoded',
    },
    {
      input: '/path-segment/🚀',
      output: '/path-segment/🚀',
      type: 'not encoded',
    },
  ])(
    'should resolve $input to $output when the path segment is $type',
    async ({ input, output }) => {
      const { router } = createTestRouter()

      window.history.pushState({}, '', input)

      await act(() => render(<RouterProvider router={router} />))
      await act(() => router.load())

      expect(router.state.location.pathname).toBe(output)
    },
  )
})

describe('router emits events during rendering', () => {
  it('during initial load, should emit the "onResolved" event', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/'] }),
    )

    const unsub = router.subscribe('onResolved', mockFn1)
    await act(() => router.load())
    await act(() => render(<RouterProvider router={router} />))

    await waitFor(() => expect(mockFn1).toBeCalled())
    unsub()
  })

  it('after a navigation, should have emitted the "onResolved" event twice', async () => {
    const { router } = createTestRouter(
      createMemoryHistory({ initialEntries: ['/'] }),
    )

    const unsub = router.subscribe('onResolved', mockFn1)
    await act(() => router.load())
    await act(() => render(<RouterProvider router={router} />))

    await act(() => router.navigate({ to: '/$', params: { _splat: 'tanner' } }))

    await waitFor(() => expect(mockFn1).toBeCalledTimes(2))
    unsub()
  })
})
