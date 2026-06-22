import type { UserProfile } from '@/stores/auth'

export function inferEntityType(email: string): string {
  if (email.includes('superadmin') || email.includes('super_admin')) return 'superadmin'
  if (email.includes('admin')) return 'admin'
  if (email.includes('tutor') || email.includes('teacher')) return 'teacher'
  if (email.includes('followup') || email.includes('follow_up')) return 'followup_officer'
  if (email.includes('academic') || email.includes('manager')) return 'academic_manager'
  if (email.includes('student')) return 'student'
  return 'user'
}

export function inferRoles(entityType: string): string[] {
  switch (entityType) {
    case 'admin': return ['ADMIN']
    case 'superadmin':
    case 'super_admin': return ['SUPER_ADMIN']
    case 'teacher':
    case 'tutor': return ['TUTOR']
    case 'followup_officer':
    case 'follow_up_officer':
    case 'followup': return ['FOLLOWUP_OFFICER']
    case 'academic_manager':
    case 'academic': return ['ACADEMIC_MANAGER']
    case 'student': return ['STUDENT']
    default: return ['USER']
  }
}

export function inferRolesFromEmail(email: string): string[] {
  if (email.includes('superadmin') || email.includes('super_admin')) return ['SUPER_ADMIN']
  if (email.includes('admin')) return ['ADMIN']
  if (email.includes('tutor') || email.includes('teacher')) return ['TUTOR']
  if (email.includes('followup') || email.includes('follow_up')) return ['FOLLOWUP_OFFICER']
  if (email.includes('academic') || email.includes('manager')) return ['ACADEMIC_MANAGER']
  if (email.includes('student')) return ['STUDENT']
  return ['USER']
}

export function buildUser(data: UserProfile): UserProfile {
  const email = data.email || ''
  const localImage = email ? localStorage.getItem('cached_profile_image_' + email) : null

  let entityType = data.entity_type
  if (typeof entityType === 'string') {
    entityType = entityType.toLowerCase()
  } else if (email) {
    entityType = inferEntityType(email)
  } else {
    entityType = 'user'
  }

  let roles = data.roles
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    roles = inferRoles(entityType)
  }

  const createdAt = data.createdAt || data.created_at || null
  const updatedAt = data.updatedAt || data.updated_at || null
  const lastLoginAt = data.last_login_at || data.lastLoginAt || null
  const deletedAt = data.deletedAt || data.deleted_at || null

  return {
    ...data,
    entity_type: entityType,
    roles,
    profile_image: localImage || data.profile_image || (data.profileImage as string | null | undefined) || null,
    createdAt,
    updatedAt,
    last_login_at: lastLoginAt,
    deletedAt,
    name:
      [data.first_name, data.last_name].filter((v): v is string => !!v).join(' ') ||
      data.email ||
      'User',
  }
}

export function buildFallbackProfile(email: string, partial?: UserProfile | null): UserProfile {
  const namePart = email.split('@')[0] || 'User'
  const parts = namePart.split(/[\._-]/)
  const first = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'User'
  const last = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : ''

  return {
    ...partial,
    email,
    first_name: first,
    last_name: last,
    is_active: partial?.is_active ?? true,
    status: partial?.status || 'ACTIVE',
    entity_type: partial?.entity_type || inferEntityType(email),
    roles: partial?.roles || inferRolesFromEmail(email),
  }
}
