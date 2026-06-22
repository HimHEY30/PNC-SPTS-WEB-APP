import type { UserProfile } from '@/stores/auth'

const USER_CACHE_KEY = 'user_profile'

const SEED_USERS: UserProfile[] = [
  {
    id: 'cmq9cc6ss0000o701m58hf20h',
    first_name: 'Public',
    last_name: 'Registration',
    email: 'newuser@example.com',
    phone: '+855968118938',
    entity_type: 'teacher',
    is_active: true,
    status: 'ACTIVE',
    deleted_at: null,
    created_at: '2026-06-11T10:14:30.509Z',
    updated_at: '2026-06-15T16:04:42.752Z',
    roles: ['TUTOR'],
  },
  {
    id: 'tutor-default-id',
    first_name: 'Default',
    last_name: 'Tutor',
    email: 'tutor@example.com',
    phone: '+85512345678',
    entity_type: 'teacher',
    is_active: true,
    status: 'ACTIVE',
    deleted_at: null,
    created_at: '2026-06-11T10:14:30.509Z',
    updated_at: '2026-06-15T16:04:42.752Z',
    roles: ['TUTOR'],
  },
  {
    id: 'admin-default-id',
    first_name: 'System',
    last_name: 'Admin',
    email: 'admin@example.com',
    phone: '+85587654321',
    entity_type: 'admin',
    is_active: true,
    status: 'ACTIVE',
    deleted_at: null,
    created_at: '2026-06-11T10:14:30.509Z',
    updated_at: '2026-06-15T16:04:42.752Z',
    roles: ['ADMIN'],
  },
  {
    id: 'superadmin-default-id',
    first_name: 'Super',
    last_name: 'Admin',
    email: 'superadmin@example.com',
    phone: '+85599999999',
    entity_type: 'super_admin',
    is_active: true,
    status: 'ACTIVE',
    deleted_at: null,
    created_at: '2026-06-11T10:14:30.509Z',
    updated_at: '2026-06-15T16:04:42.752Z',
    roles: ['SUPER_ADMIN'],
  },
]

export function preseedUserCache(): void {
  for (const user of SEED_USERS) {
    if (!user.email) continue
    const key = 'cached_user_record_' + user.email.toLowerCase()
    const existing = localStorage.getItem(key)
    if (!existing) {
      localStorage.setItem(key, JSON.stringify(user))
    } else {
      try {
        const parsed = JSON.parse(existing)
        const first = (parsed?.first_name || '').toLowerCase()
        const emailPrefix = user.email.split('@')[0].toLowerCase()

        const isHeuristic =
          first === 'newuser' ||
          first === 'user' ||
          first === emailPrefix ||
          !parsed.status ||
          parsed.is_active === undefined

        if (isHeuristic) {
          localStorage.setItem(key, JSON.stringify(user))
        }
      } catch {
        localStorage.setItem(key, JSON.stringify(user))
      }
    }
  }
}

export function loadCachedUser(): UserProfile | null {
  try {
    preseedUserCache()
    const raw = localStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as UserProfile
  } catch {
    return null
  }
}

export function cacheUser(u: UserProfile | null): void {
  if (u) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u))
  } else {
    localStorage.removeItem(USER_CACHE_KEY)
  }
}

export function cacheUserRecord(email: string, data: UserProfile): void {
  localStorage.setItem('cached_user_record_' + email.toLowerCase(), JSON.stringify(data))
}

export function loadUserRecord(email: string): UserProfile | null {
  try {
    const raw = localStorage.getItem('cached_user_record_' + email.toLowerCase())
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}
