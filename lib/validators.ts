import { z } from "zod";

const status = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]);

// ============================================
// AUTH
// ============================================
export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  // Public self-registration is limited to non-admin roles — ADMIN/
  // SUPER_ADMIN/custom staff roles must be created by an existing admin via
  // POST /api/users so account creation can't be used to self-grant
  // administrative access.
  role: z.enum(["TEACHER", "STUDENT", "PARENT"]),
  // Required only for STUDENT/TEACHER — links this new login to the
  // profile record an admin already created via Module 2.
  rollNumber: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
  // The school's slug, shared by the school admin, picks which tenant the
  // new account joins.
  schoolCode: z.string().trim().toLowerCase().min(1, "School code is required"),
});

// Public "Start free trial" signup: creates a new School tenant plus its
// first ADMIN user in one step.
export const schoolSignupSchema = z.object({
  schoolName: z.string().trim().min(2, "School name is required").max(120),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const linkChildSchema = z.object({
  rollNumber: z.string().trim().min(1, "Roll number is required"),
});

// ============================================
// USERS / ROLES / PERMISSIONS (RBAC)
// ============================================
export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  roleId: z.string().trim().min(1, "Role is required"),
  status: status.optional(),
  // Optional — links this account to a profile an admin already created,
  // same as public self-registration.
  rollNumber: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
});

export const userUpdateSchema = z.object({
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional().or(z.literal("")),
  roleId: z.string().trim().min(1).optional(),
  status: status.optional(),
});

export const adminResetPasswordSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const roleCreateSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  permissionKeys: z.array(z.string().trim().min(1)).default([]),
});

export const roleUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().or(z.literal("")),
  permissionKeys: z.array(z.string().trim().min(1)).optional(),
});

// ============================================
// STUDENT
// ============================================
export const studentCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  rollNumber: z.string().trim().min(1, "Roll number is required"),
  dateOfBirth: z.coerce.date({ message: "Valid date of birth is required" }),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  guardianName: z.string().trim().min(1, "Guardian name is required"),
  guardianPhone: z.string().trim().min(1, "Guardian phone is required"),
  address: z.string().trim().optional().or(z.literal("")),
  profilePic: z.string().trim().optional().or(z.literal("")),
  status: status.optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

// ============================================
// TEACHER
// ============================================
export const teacherCreateSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  phone: z.string().trim().optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  qualifications: z.string().trim().optional().or(z.literal("")),
  experience: z.coerce.number().int().min(0).optional(),
  address: z.string().trim().optional().or(z.literal("")),
  profilePic: z.string().trim().optional().or(z.literal("")),
  status: status.optional(),
});

export const teacherUpdateSchema = teacherCreateSchema.partial();

// ============================================
// CLASS
// ============================================
export const classCreateSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  section: z.string().trim().min(1, "Section is required"),
  capacity: z.coerce.number().int().positive("Capacity must be a positive number"),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, "Academic year must look like 2024-2025"),
  status: status.optional(),
});

export const classUpdateSchema = classCreateSchema.partial();

// ============================================
// SUBJECT
// ============================================
export const subjectCreateSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required"),
  code: z.string().trim().min(1, "Subject code is required"),
  status: status.optional(),
});

export const subjectUpdateSchema = subjectCreateSchema.partial();

// ============================================
// ATTENDANCE
// ============================================
const attendanceStatus = z.enum(["PRESENT", "ABSENT", "LEAVE"]);

export const markStudentAttendanceSchema = z.object({
  studentId: z.string().trim().min(1, "studentId is required"),
  date: z.coerce.date(),
  status: attendanceStatus,
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const markTeacherAttendanceSchema = z.object({
  teacherId: z.string().trim().min(1, "teacherId is required"),
  date: z.coerce.date(),
  status: attendanceStatus,
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const bulkMarkAttendanceSchema = z.object({
  classId: z.string().trim().min(1, "classId is required"),
  date: z.coerce.date(),
  records: z
    .array(
      z.object({
        studentId: z.string().trim().min(1),
        status: attendanceStatus,
        remarks: z.string().trim().optional().or(z.literal("")),
      }),
    )
    .min(1, "At least one attendance record is required"),
});

export const attendanceReportQuerySchema = z.object({
  studentId: z.string().trim().optional(),
  teacherId: z.string().trim().optional(),
  classId: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ============================================
// MARKS / ACADEMICS
// ============================================
export const markEntrySchema = z.object({
  studentId: z.string().trim().min(1, "studentId is required"),
  teacherId: z.string().trim().min(1, "teacherId is required"),
  examId: z.string().trim().min(1, "examId is required"),
  subjectId: z.string().trim().min(1, "subjectId is required"),
  marks: z.coerce.number().min(0, "Marks cannot be negative"),
  totalMarks: z.coerce.number().positive("Total marks must be positive"),
  remarks: z.string().trim().optional().or(z.literal("")),
});

export const marksQuerySchema = z.object({
  studentId: z.string().trim().optional(),
  examId: z.string().trim().optional(),
  subjectId: z.string().trim().optional(),
  classId: z.string().trim().optional(),
});

export const reportCardQuerySchema = z.object({
  studentId: z.string().trim().min(1, "studentId is required"),
  examId: z.string().trim().min(1, "examId is required"),
});

export const publishResultsSchema = z.object({
  examId: z.string().trim().min(1, "examId is required"),
});

// ============================================
// EXAMS
// ============================================
const examType = z.enum(["MIDTERM", "FINAL", "QUARTERLY", "UNIT_TEST", "MOCK"]);

export const examCreateSchema = z.object({
  name: z.string().trim().min(1, "Exam name is required"),
  classId: z.string().trim().min(1, "classId is required"),
  type: examType,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  subjectIds: z.array(z.string().trim().min(1)).min(1, "Select at least one subject"),
});

export const examUpdateSchema = examCreateSchema.partial();

export const examTimetableEntrySchema = z.object({
  subjectId: z.string().trim().min(1, "subjectId is required"),
  date: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  room: z.string().trim().min(1, "Room is required"),
});

export const createExamTimetableSchema = z.object({
  examId: z.string().trim().min(1, "examId is required"),
  entries: z.array(examTimetableEntrySchema).min(1, "At least one timetable entry is required"),
});

export const assignInvigilatorSchema = z.object({
  examId: z.string().trim().min(1, "examId is required"),
  teacherId: z.string().trim().min(1, "teacherId is required"),
});

export const examScheduleQuerySchema = z.object({
  examId: z.string().trim().min(1, "examId is required"),
});

// ============================================
// TIMETABLE
// ============================================
export const timetableSlotSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(1).max(7),
  periodNumber: z.coerce.number().int().positive(),
  startTime: z.string().trim().min(1, "Start time is required"),
  endTime: z.string().trim().min(1, "End time is required"),
  room: z.string().trim().min(1, "Room is required"),
  teacherId: z.string().trim().min(1, "teacherId is required"),
  subjectId: z.string().trim().min(1, "subjectId is required"),
});

export const createClassTimetableSchema = z.object({
  classId: z.string().trim().min(1, "classId is required"),
  slots: z.array(timetableSlotSchema).min(1, "At least one slot is required"),
});

export const detectConflictsSchema = z.object({
  classId: z.string().trim().min(1, "classId is required"),
  slots: z.array(timetableSlotSchema).min(1, "At least one slot is required"),
});

export const assignSubstituteSchema = z.object({
  slotId: z.string().trim().min(1, "slotId is required"),
  teacherId: z.string().trim().min(1, "teacherId is required"),
});

// ============================================
// COMMUNICATION
// ============================================
const priority = z.enum(["HIGH", "MEDIUM", "LOW"]);

export const announcementCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
  priority: priority.default("MEDIUM"),
  // A Role.key (e.g. "ADMIN"), or empty/omitted to target everyone. The
  // "Everyone" option in the form submits "" rather than leaving the field
  // out, so that has to normalize to undefined here rather than fail
  // validation.
  targetRole: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : undefined)),
});

export const announcementUpdateSchema = announcementCreateSchema.partial();

export const sendMessageSchema = z.object({
  recipientId: z.string().trim().min(1, "recipientId is required"),
  content: z.string().trim().min(1, "Message cannot be empty"),
  studentId: z.string().trim().optional(),
});

export const getMessagesSchema = z.object({
  conversationId: z.string().trim().optional(),
  withUserId: z.string().trim().optional(),
});

export const sendNotificationSchema = z.object({
  userId: z.string().trim().min(1, "userId is required"),
  type: z.enum(["ATTENDANCE", "MARKS", "FEE", "ANNOUNCEMENT", "MESSAGE", "EXAM", "TIMETABLE", "ASSIGNMENT"]),
  title: z.string().trim().min(1, "Title is required"),
  message: z.string().trim().min(1, "Message is required"),
});

// ============================================
// FEES
// ============================================
export const feeStructureCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  feeType: z.string().trim().min(1, "Fee type is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  academicYear: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{4}$/, "Academic year must look like 2024-2025"),
  dueDate: z.coerce.date(),
});

export const generateInvoicesSchema = z
  .object({
    feeStructureId: z.string().trim().min(1, "feeStructureId is required"),
    studentId: z.string().trim().optional(),
    classId: z.string().trim().optional(),
  })
  .refine((data) => data.studentId || data.classId, {
    message: "Provide studentId or classId",
    path: ["studentId"],
  });

export const recordPaymentSchema = z.object({
  feeId: z.string().trim().min(1, "feeId is required"),
  paidDate: z.coerce.date().optional(),
});

export const sendReminderSchema = z.object({
  feeId: z.string().trim().min(1, "feeId is required"),
});

export const invoicesQuerySchema = z.object({
  studentId: z.string().trim().optional(),
  classId: z.string().trim().optional(),
  status: z.enum(["PENDING", "PAID", "OVERDUE"]).optional(),
});

// ============================================
// REPORTS
// ============================================
export const attendanceReportRequestSchema = z.object({
  classId: z.string().trim().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const academicReportRequestSchema = z.object({
  examId: z.string().trim().min(1, "examId is required"),
});

export const exportReportSchema = z.object({
  type: z.enum(["attendance", "academic", "financial"]),
  examId: z.string().trim().optional(),
  classId: z.string().trim().optional(),
});

// ============================================
// RELATIONSHIPS
// ============================================
export const enrollStudentSchema = z.object({
  studentId: z.string().trim().min(1, "studentId is required"),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().trim().min(1, "teacherId is required"),
});

export const assignSubjectSchema = z.object({
  subjectId: z.string().trim().min(1, "subjectId is required"),
});

// ============================================
// PAGINATION / SEARCH
// ============================================
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const searchSchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
});
