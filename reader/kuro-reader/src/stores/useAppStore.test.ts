import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// 仅 mock 需要 async crypto 的函数；时序纯函数（isLockedUntilExpired / calculateLockUntil）保留真实现
vi.mock('@/services/gestureAuth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/gestureAuth')>()
  return {
    ...actual,
    setupGesture: vi.fn(),
    verifyGesture: vi.fn(),
    hashSecurityAnswer: vi.fn(),
    verifySecurityAnswer: vi.fn(),
  }
})

import { setupGesture, verifyGesture, hashSecurityAnswer, verifySecurityAnswer } from '@/services/gestureAuth'
import { useAppStore } from '@/stores/useAppStore'

const setupGestureMock = vi.mocked(setupGesture)
const verifyGestureMock = vi.mocked(verifyGesture)
const hashSecurityAnswerMock = vi.mocked(hashSecurityAnswer)
const verifySecurityAnswerMock = vi.mocked(verifySecurityAnswer)

const BASE_TIME = Date.UTC(2026, 7, 24)
const LOCK_TIMEOUT_MS = 5 * 60 * 1000
const LOCK_DURATION_ON_MAX_FAIL_MS = 30 * 1000

const initialState = useAppStore.getState()

const resetAppState = () => {
  useAppStore.setState(initialState, true)
}

const enableGestureAuth = () => {
  useAppStore.getState().updateAuthConfig({
    isEnabled: true,
    method: 'gesture',
    gestureHash: 'hash',
    gestureSalt: 'salt',
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  resetAppState()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('theme & settings', () => {
  it('setTheme syncs settings.theme', () => {
    useAppStore.getState().setTheme('dark')

    const { theme, settings } = useAppStore.getState()
    expect(theme).toBe('dark')
    expect(settings.theme).toBe('dark')
  })

  it('toggleDarkMode flips light/dark in both places', () => {
    useAppStore.getState().toggleDarkMode()
    expect(useAppStore.getState().theme).toBe('dark')
    expect(useAppStore.getState().settings.theme).toBe('dark')

    useAppStore.getState().toggleDarkMode()
    expect(useAppStore.getState().theme).toBe('light')
    expect(useAppStore.getState().settings.theme).toBe('light')
  })

  it('updateSettings merges shallowly and syncs top-level theme', () => {
    useAppStore.getState().updateSettings({ fontSize: 20, theme: 'auto' })

    const { theme, settings } = useAppStore.getState()
    expect(theme).toBe('auto')
    expect(settings.fontSize).toBe(20)
    expect(settings.paperMode).toBe(initialState.settings.paperMode)
  })

  it('updateAuthConfig merges nested auth partial', () => {
    useAppStore.getState().updateAuthConfig({ failedAttempts: 2 })

    const auth = useAppStore.getState().settings.auth
    expect(auth.failedAttempts).toBe(2)
    expect(auth.isEnabled).toBe(false)
    expect(auth.maxAttempts).toBe(initialState.settings.auth.maxAttempts)
  })
})

describe('checkAuthTimeout', () => {
  it('returns false when auth is disabled', () => {
    useAppStore.getState().setAuthenticated(true)
    expect(useAppStore.getState().checkAuthTimeout()).toBe(false)
  })

  it('returns false when authenticated and within timeout', () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)

    enableGestureAuth()
    useAppStore.getState().setAuthenticated(true)
    vi.setSystemTime(BASE_TIME + LOCK_TIMEOUT_MS - 1000)

    expect(useAppStore.getState().checkAuthTimeout()).toBe(false)
    expect(useAppStore.getState().isAuthenticated).toBe(true)
  })

  it('logs out and returns true when timeout exceeded', () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)

    enableGestureAuth()
    useAppStore.getState().setAuthenticated(true)
    vi.setSystemTime(BASE_TIME + LOCK_TIMEOUT_MS + 1)

    expect(useAppStore.getState().checkAuthTimeout()).toBe(true)
    expect(useAppStore.getState().isAuthenticated).toBe(false)
  })

  it('returns true when already unauthenticated', () => {
    enableGestureAuth()
    useAppStore.getState().setAuthenticated(false)
    expect(useAppStore.getState().checkAuthTimeout()).toBe(true)
  })
})

describe('setupGestureLock', () => {
  it('enables gesture auth and stores hash/salt', async () => {
    setupGestureMock.mockResolvedValue({ hash: 'h1', salt: 's1' })

    await useAppStore.getState().setupGestureLock([1, 2, 3, 4])

    const { settings, isAuthenticated } = useAppStore.getState()
    expect(settings.auth.isEnabled).toBe(true)
    expect(settings.auth.method).toBe('gesture')
    expect(settings.auth.gestureHash).toBe('h1')
    expect(settings.auth.gestureSalt).toBe('s1')
    expect(settings.auth.failedAttempts).toBe(0)
    expect(isAuthenticated).toBe(true)
  })

  it('hashes security questions when provided', async () => {
    setupGestureMock.mockResolvedValue({ hash: 'h1', salt: 's1' })
    hashSecurityAnswerMock.mockResolvedValue({ answerHash: 'ah', answerSalt: 'as' })

    await useAppStore.getState().setupGestureLock([1, 2, 3, 4], [
      { question: '宠物名', answer: 'kuro' },
    ])

    const questions = useAppStore.getState().settings.auth.securityQuestions
    expect(questions).toHaveLength(1)
    expect(questions?.[0]).toEqual({ question: '宠物名', answerHash: 'ah', answerSalt: 'as' })
  })
})

describe('verifyGestureLock', () => {
  it('rejects immediately while locked without verifying', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)

    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ lockUntil: BASE_TIME + LOCK_DURATION_ON_MAX_FAIL_MS })

    const result = await useAppStore.getState().verifyGestureLock([1, 2, 3, 4])
    expect(result).toBe(false)
    expect(verifyGestureMock).not.toHaveBeenCalled()
  })

  it('rejects when no gesture hash configured', async () => {
    const result = await useAppStore.getState().verifyGestureLock([1, 2, 3, 4])
    expect(result).toBe(false)
    expect(verifyGestureMock).not.toHaveBeenCalled()
  })

  it('resets failures and authenticates on success', async () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ failedAttempts: 2 })
    verifyGestureMock.mockResolvedValue(true)
    useAppStore.getState().setAuthenticated(false)

    const result = await useAppStore.getState().verifyGestureLock([1, 2, 3, 4])

    expect(result).toBe(true)
    const { settings, isAuthenticated } = useAppStore.getState()
    expect(settings.auth.failedAttempts).toBe(0)
    expect(settings.auth.lockUntil).toBeUndefined()
    expect(isAuthenticated).toBe(true)
  })

  it('increments failedAttempts without locking below maxAttempts', async () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ maxAttempts: 3, failedAttempts: 1 })
    verifyGestureMock.mockResolvedValue(false)

    const result = await useAppStore.getState().verifyGestureLock([1, 2, 3])

    expect(result).toBe(false)
    const auth = useAppStore.getState().settings.auth
    expect(auth.failedAttempts).toBe(2)
    expect(auth.lockUntil).toBeUndefined()
  })

  it('locks until now + lockDuration when failures reach maxAttempts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(BASE_TIME)

    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ maxAttempts: 3, failedAttempts: 2 })
    verifyGestureMock.mockResolvedValue(false)

    await useAppStore.getState().verifyGestureLock([1, 2, 3])

    const auth = useAppStore.getState().settings.auth
    expect(auth.failedAttempts).toBe(3)
    expect(auth.lockUntil).toBe(BASE_TIME + LOCK_DURATION_ON_MAX_FAIL_MS)

    // 锁定期内再次尝试：直接拒绝，不触发验证
    verifyGestureMock.mockClear()
    const again = await useAppStore.getState().verifyGestureLock([1, 2, 3])
    expect(again).toBe(false)
    expect(verifyGestureMock).not.toHaveBeenCalled()
  })
})

describe('disable & clear auth', () => {
  it('disableGestureLock clears gesture fields but keeps auth enabled false', () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ failedAttempts: 2, lockUntil: 123 })

    useAppStore.getState().disableGestureLock()

    const auth = useAppStore.getState().settings.auth
    expect(auth.isEnabled).toBe(false)
    expect(auth.method).toBe('auto')
    expect(auth.gestureHash).toBeUndefined()
    expect(auth.failedAttempts).toBe(0)
    expect(auth.lockUntil).toBeUndefined()
  })

  it('clearAuthData restores defaults including securityQuestions', () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({
      securityQuestions: [{ question: 'q', answerHash: 'h', answerSalt: 's' }],
    })

    useAppStore.getState().clearAuthData()

    const auth = useAppStore.getState().settings.auth
    expect(auth.isEnabled).toBe(false)
    expect(auth.securityQuestions).toBeUndefined()
    expect(useAppStore.getState().isAuthenticated).toBe(true)
  })
})

describe('security questions', () => {
  const storedQuestions = [
    { question: 'q1', answerHash: 'h1', answerSalt: 's1' },
    { question: 'q2', answerHash: 'h2', answerSalt: 's2' },
  ]

  it('returns false when no questions stored', async () => {
    const result = await useAppStore.getState().verifySecurityQuestions(['a'])
    expect(result).toBe(false)
    expect(verifySecurityAnswerMock).not.toHaveBeenCalled()
  })

  it('returns false on answers length mismatch', async () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ securityQuestions: storedQuestions })

    const result = await useAppStore.getState().verifySecurityQuestions(['only-one'])
    expect(result).toBe(false)
    expect(verifySecurityAnswerMock).not.toHaveBeenCalled()
  })

  it('returns true when every answer verifies', async () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ securityQuestions: storedQuestions })
    verifySecurityAnswerMock.mockResolvedValue(true)

    const result = await useAppStore.getState().verifySecurityQuestions(['a1', 'a2'])
    expect(result).toBe(true)
    expect(verifySecurityAnswerMock).toHaveBeenCalledTimes(2)
  })

  it('short-circuits on first wrong answer', async () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ securityQuestions: storedQuestions })
    verifySecurityAnswerMock.mockResolvedValueOnce(false)

    const result = await useAppStore.getState().verifySecurityQuestions(['wrong', 'a2'])
    expect(result).toBe(false)
    expect(verifySecurityAnswerMock).toHaveBeenCalledTimes(1)
  })

  it('resetLockViaSecurityQuestions clears lock and authenticates', () => {
    enableGestureAuth()
    useAppStore.getState().updateAuthConfig({ failedAttempts: 3, lockUntil: 9999999 })
    useAppStore.getState().setAuthenticated(false)

    useAppStore.getState().resetLockViaSecurityQuestions()

    const { settings, isAuthenticated } = useAppStore.getState()
    expect(settings.auth.gestureHash).toBeUndefined()
    expect(settings.auth.failedAttempts).toBe(0)
    expect(settings.auth.lockUntil).toBeUndefined()
    expect(isAuthenticated).toBe(true)
  })
})

describe('persist rehydration', () => {
  it('fills missing auth fields with defaults for legacy persisted state', async () => {
    localStorage.setItem(
      'kuro-reader-app',
      JSON.stringify({
        state: { theme: 'dark', settings: { fontSize: 20 } },
        version: 0,
      })
    )

    vi.resetModules()
    const { useAppStore: freshStore } = await import('@/stores/useAppStore')
    const state = freshStore.getState()

    expect(state.theme).toBe('dark')
    expect(state.settings.fontSize).toBe(20)
    // 旧数据缺失的 auth 字段由默认值补全
    expect(state.settings.auth.isEnabled).toBe(false)
    expect(state.settings.auth.maxAttempts).toBe(initialState.settings.auth.maxAttempts)
    expect(state.settings.paperMode).toBe(initialState.settings.paperMode)

    localStorage.removeItem('kuro-reader-app')
  })
})
