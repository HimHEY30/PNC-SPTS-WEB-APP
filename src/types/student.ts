export interface CreateStudentPayload {
  studentCode: string
  firstName: string
  lastName: string
  gender?: string
  dateOfBirth?: string | null
  placeOfBirth?: string | null
  phone?: string | null
  email: string
  classId?: string | null
  status?: string
  profileImage?: string | null
}

export interface UpdateStudentPayload {
  studentCode?: string
  firstName?: string
  lastName?: string
  gender?: string
  dateOfBirth?: string | null
  placeOfBirth?: string | null
  phone?: string | null
  email?: string
  classId?: string | null
  status?: string
  profileImage?: string | null
}
