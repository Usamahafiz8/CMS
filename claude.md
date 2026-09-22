# School Management CMS - Complete Project Documentation

**Project Name:** SchoolHub CMS  
**Tech Stack:** Next.js 14+ | React | TypeScript | PostgreSQL | Prisma | Tailwind CSS | PWA  
**Deployment:** Vercel | Docker  
**Database:** PostgreSQL + Redis  
**Estimated Timeline:** 8-10 weeks  
**Purpose:** Single codebase for Web + Mobile App (PWA) + Native Mobile (React Native)

---

## 📋 PROJECT OVERVIEW

SchoolHub is a comprehensive School Management System built with **Next.js** that works seamlessly on:
- ✅ Web browsers (desktop/tablet)
- ✅ Mobile devices via PWA (works offline, installable)
- ✅ Native mobile apps (React Native - optional)

All from **ONE single codebase** - no duplicate code, no separate teams!

**Key Benefits:**
- Single framework for everything (Next.js handles backend + frontend)
- Write once, deploy everywhere (web + mobile)
- Offline functionality via PWA
- Real-time sync when online
- Push notifications
- Role-based access control (Admin, Teacher, Student, Parent)

---

## 🏗️ COMPLETE PROJECT STRUCTURE

```
school-management-cms/
│
├── .env.local                      # Local environment variables
├── .env.production                 # Production environment variables
├── .env.example                    # Example env file
├── .gitignore                      # Git ignore rules
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── next.config.js                  # Next.js configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── prisma.schema                   # Database schema (Prisma ORM)
├── README.md                       # Project documentation
│
├── pages/                          # Next.js pages & API routes
│   ├── api/                        # Backend API endpoints
│   │   ├── auth/
│   │   │   ├── login.ts            # POST /api/auth/login
│   │   │   ├── register.ts         # POST /api/auth/register
│   │   │   ├── logout.ts           # POST /api/auth/logout
│   │   │   ├── refresh.ts          # POST /api/auth/refresh
│   │   │   ├── reset-password.ts   # POST /api/auth/reset-password
│   │   │   └── verify-token.ts     # POST /api/auth/verify-token
│   │   │
│   │   ├── students/
│   │   │   ├── index.ts            # GET /api/students (all)
│   │   │   ├── [id].ts             # GET/PUT/DELETE /api/students/[id]
│   │   │   ├── bulk-import.ts      # POST /api/students/bulk-import
│   │   │   └── search.ts           # GET /api/students/search?q=
│   │   │
│   │   ├── teachers/
│   │   │   ├── index.ts            # GET /api/teachers
│   │   │   ├── [id].ts             # GET/PUT/DELETE /api/teachers/[id]
│   │   │   ├── assign-class.ts     # POST /api/teachers/assign-class
│   │   │   └── assign-subject.ts   # POST /api/teachers/assign-subject
│   │   │
│   │   ├── classes/
│   │   │   ├── index.ts            # GET /api/classes
│   │   │   ├── [id].ts             # GET /api/classes/[id]
│   │   │   ├── enroll-student.ts   # POST /api/classes/enroll-student
│   │   │   └── get-students.ts     # GET /api/classes/[id]/students
│   │   │
│   │   ├── subjects/
│   │   │   ├── index.ts            # GET /api/subjects
│   │   │   ├── [id].ts             # GET/PUT/DELETE /api/subjects/[id]
│   │   │   └── assign.ts           # POST /api/subjects/assign
│   │   │
│   │   ├── attendance/
│   │   │   ├── mark-student.ts     # POST /api/attendance/mark-student
│   │   │   ├── mark-teacher.ts     # POST /api/attendance/mark-teacher
│   │   │   ├── get-student-report.ts
│   │   │   ├── get-teacher-report.ts
│   │   │   └── bulk-mark.ts        # POST /api/attendance/bulk-mark
│   │   │
│   │   ├── academics/
│   │   │   ├── mark-entry.ts       # POST /api/academics/mark-entry
│   │   │   ├── get-marks.ts        # GET /api/academics/marks
│   │   │   ├── get-report-card.ts  # GET /api/academics/report-card
│   │   │   ├── calculate-gpa.ts    # GET /api/academics/gpa
│   │   │   └── publish-results.ts  # POST /api/academics/publish-results
│   │   │
│   │   ├── exams/
│   │   │   ├── index.ts            # GET /api/exams
│   │   │   ├── [id].ts             # GET/PUT/DELETE /api/exams/[id]
│   │   │   ├── create-timetable.ts # POST /api/exams/create-timetable
│   │   │   ├── assign-invigilator.ts
│   │   │   └── get-schedule.ts     # GET /api/exams/schedule
│   │   │
│   │   ├── timetable/
│   │   │   ├── create-class-timetable.ts
│   │   │   ├── create-teacher-timetable.ts
│   │   │   ├── detect-conflicts.ts
│   │   │   ├── get-class-timetable.ts
│   │   │   ├── get-teacher-timetable.ts
│   │   │   ├── assign-substitute.ts
│   │   │   └── periods/index.ts    # Manage periods/slots
│   │   │
│   │   ├── communication/
│   │   │   ├── announcements/
│   │   │   │   ├── index.ts        # GET/POST announcements
│   │   │   │   └── [id].ts         # GET/PUT/DELETE
│   │   │   ├── messages/
│   │   │   │   ├── send.ts         # POST /api/communication/messages/send
│   │   │   │   └── get.ts          # GET /api/communication/messages
│   │   │   └── notifications/
│   │   │       ├── send.ts         # POST
│   │   │       └── get.ts          # GET
│   │   │
│   │   ├── fees/
│   │   │   ├── structure/
│   │   │   │   ├── index.ts        # GET fee structure
│   │   │   │   └── create.ts       # POST create fee structure
│   │   │   ├── invoices/
│   │   │   │   ├── generate.ts     # POST generate invoice
│   │   │   │   └── get.ts          # GET invoices
│   │   │   ├── payments/
│   │   │   │   ├── record.ts       # POST record payment
│   │   │   │   └── get.ts          # GET payment records
│   │   │   ├── reminders/
│   │   │   │   └── send.ts         # POST send reminder
│   │   │   └── reports/
│   │   │       └── outstanding.ts  # GET outstanding fees report
│   │   │
│   │   ├── reports/
│   │   │   ├── attendance.ts       # GET attendance report
│   │   │   ├── academic.ts         # GET academic report
│   │   │   ├── financial.ts        # GET financial report
│   │   │   ├── performance.ts      # GET performance report
│   │   │   └── export.ts           # POST export (PDF/Excel)
│   │   │
│   │   ├── admin/
│   │   │   ├── dashboard.ts        # GET admin stats
│   │   │   ├── backup.ts           # POST backup data
│   │   │   ├── restore.ts          # POST restore data
│   │   │   └── settings.ts         # GET/POST system settings
│   │   │
│   │   ├── users/
│   │   │   ├── profile.ts          # GET user profile
│   │   │   ├── update-profile.ts   # PUT update profile
│   │   │   └── change-password.ts  # POST change password
│   │   │
│   │   └── health.ts               # GET /api/health (for monitoring)
│   │
│   ├── admin/                      # Admin dashboard pages
│   │   ├── index.tsx               # /admin → Admin dashboard
│   │   ├── students/index.tsx      # /admin/students → Student list
│   │   ├── students/[id].tsx       # /admin/students/[id] → Edit student
│   │   ├── teachers/index.tsx
│   │   ├── classes/index.tsx
│   │   ├── attendance/index.tsx
│   │   ├── academics/index.tsx
│   │   ├── exams/index.tsx
│   │   ├── timetable/index.tsx
│   │   ├── fees/index.tsx
│   │   ├── reports/index.tsx
│   │   ├── communication/index.tsx
│   │   └── settings/index.tsx
│   │
│   ├── teacher/                    # Teacher portal pages
│   │   ├── index.tsx               # /teacher → Teacher dashboard
│   │   ├── attendance/index.tsx    # Mark attendance
│   │   ├── marks/index.tsx         # Enter marks
│   │   ├── timetable/index.tsx     # View timetable
│   │   ├── messages/index.tsx      # Messaging
│   │   └── announcements/index.tsx
│   │
│   ├── student/                    # Student portal pages
│   │   ├── index.tsx               # /student → Student dashboard
│   │   ├── attendance/index.tsx    # View attendance
│   │   ├── marks/index.tsx         # View marks
│   │   ├── timetable/index.tsx     # View timetable
│   │   ├── messages/index.tsx
│   │   └── announcements/index.tsx
│   │
│   ├── parent/                     # Parent portal pages
│   │   ├── index.tsx               # /parent → Parent dashboard
│   │   ├── child-attendance/index.tsx
│   │   ├── child-marks/index.tsx
│   │   ├── child-timetable/index.tsx
│   │   ├── fees/index.tsx
│   │   ├── messages/index.tsx
│   │   └── announcements/index.tsx
│   │
│   ├── auth/                       # Authentication pages
│   │   ├── login.tsx               # /auth/login
│   │   ├── register.tsx            # /auth/register
│   │   ├── forgot-password.tsx     # /auth/forgot-password
│   │   └── reset-password.tsx      # /auth/reset-password
│   │
│   ├── 404.tsx                     # 404 error page
│   ├── 500.tsx                     # 500 error page
│   ├── _app.tsx                    # App wrapper
│   ├── _document.tsx               # Document wrapper
│   └── index.tsx                   # Home page / landing
│
├── components/                     # Reusable React components
│   ├── Common/
│   │   ├── Navbar.tsx              # Top navigation
│   │   ├── Sidebar.tsx             # Side navigation
│   │   ├── Footer.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Modal.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── AlertBox.tsx
│   │
│   ├── Forms/
│   │   ├── StudentForm.tsx         # Add/Edit student
│   │   ├── TeacherForm.tsx         # Add/Edit teacher
│   │   ├── ClassForm.tsx           # Add/Edit class
│   │   ├── AttendanceForm.tsx      # Mark attendance
│   │   ├── MarksForm.tsx           # Enter marks
│   │   ├── ExamForm.tsx            # Create exam
│   │   ├── TimetableForm.tsx       # Create timetable
│   │   ├── FeeStructureForm.tsx    # Set fee structure
│   │   ├── AnnouncementForm.tsx    # Create announcement
│   │   └── MessageForm.tsx         # Send message
│   │
│   ├── Tables/
│   │   ├── StudentTable.tsx        # Display students
│   │   ├── TeacherTable.tsx        # Display teachers
│   │   ├── ClassTable.tsx
│   │   ├── AttendanceTable.tsx
│   │   ├── MarksTable.tsx
│   │   ├── ExamTable.tsx
│   │   ├── TimetableTable.tsx
│   │   ├── FeeTable.tsx
│   │   └── ReportTable.tsx
│   │
│   ├── Dashboards/
│   │   ├── AdminDashboard.tsx      # Admin overview
│   │   ├── TeacherDashboard.tsx    # Teacher overview
│   │   ├── StudentDashboard.tsx    # Student overview
│   │   ├── ParentDashboard.tsx     # Parent overview
│   │   ├── StatCard.tsx            # Stat card component
│   │   └── Chart.tsx               # Chart component
│   │
│   ├── Charts/
│   │   ├── AttendanceChart.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── FeeChart.tsx
│   │   └── EnrollmentChart.tsx
│   │
│   └── Cards/
│       ├── StudentCard.tsx
│       ├── ClassCard.tsx
│       ├── AnnouncementCard.tsx
│       └── MessageCard.tsx
│
├── lib/                            # Utility functions & helpers
│   ├── auth.ts                     # Authentication utilities
│   ├── db.ts                       # Database connection
│   ├── api.ts                      # API client helper
│   ├── validators.ts               # Input validation (Zod)
│   ├── constants.ts                # App constants
│   ├── helpers.ts                  # Common helper functions
│   ├── calculations.ts             # GPA, percentage calculations
│   ├── notifications.ts            # Notification logic
│   ├── permissions.ts              # Permission checking
│   ├── email.ts                    # Email sending
│   ├── jwt.ts                      # JWT utilities
│   └── errors.ts                   # Custom error classes
│
├── hooks/                          # Custom React hooks
│   ├── useAuth.ts                  # Authentication hook
│   ├── useStudent.ts               # Student data hook
│   ├── useAttendance.ts            # Attendance hook
│   ├── useMarks.ts                 # Marks hook
│   ├── useTimetable.ts             # Timetable hook
│   ├── useFees.ts                  # Fees hook
│   ├── useMessages.ts              # Messaging hook
│   ├── useNotifications.ts         # Notifications hook
│   ├── useFetch.ts                 # Generic fetch hook
│   └── useLocalStorage.ts          # Local storage hook
│
├── styles/                         # Global styles
│   ├── globals.css                 # Global Tailwind styles
│   ├── variables.css               # CSS variables
│   └── animations.css              # Animation styles
│
├── public/                         # Static files & PWA
│   ├── manifest.json               # PWA manifest
│   ├── service-worker.js           # Service worker for offline
│   ├── logo.png                    # App logo
│   ├── icon-192.png               # PWA icon (192x192px)
│   ├── icon-512.png               # PWA icon (512x512px)
│   ├── favicon.ico
│   └── images/
│       ├── splash-screens/
│       └── backgrounds/
│
├── prisma/                         # Database (Prisma ORM)
│   ├── schema.prisma               # Database schema & models
│   ├── seed.ts                     # Seed database with demo data
│   ├── migrations/                 # Database migrations
│   └── client.ts                   # Prisma client export
│
├── tests/                          # Test files
│   ├── unit/                       # Unit tests
│   │   ├── auth.test.ts
│   │   ├── students.test.ts
│   │   └── ...
│   ├── integration/                # Integration tests
│   │   ├── api.test.ts
│   │   └── ...
│   └── e2e/                        # End-to-end tests
│       └── scenarios.test.ts
│
├── docker/                         # Docker configuration
│   ├── Dockerfile                  # Container image
│   ├── docker-compose.yml          # Local dev with Docker
│   └── .dockerignore
│
├── config/                         # Configuration files
│   ├── database.ts                 # Database config
│   ├── email.ts                    # Email service config
│   ├── jwt.ts                      # JWT config
│   ├── roles.ts                    # Role & permission definitions
│   └── constants.ts                # App-wide constants
│
├── middleware/                     # Next.js middleware
│   ├── auth.ts                     # Auth middleware
│   ├── roleCheck.ts                # Role verification
│   └── errorHandler.ts             # Global error handler
│
└── docs/                           # Documentation
    ├── API.md                      # API documentation
    ├── DATABASE.md                 # Database schema docs
    ├── DEPLOYMENT.md               # Deployment guide
    ├── SETUP.md                    # Setup guide
    ├── ARCHITECTURE.md             # Architecture overview
    └── CONTRIBUTING.md             # Contributing guide
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

```prisma
// ============================================
// USER MODEL (Base for all users)
// ============================================
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // hashed with bcryptjs
  firstName     String
  lastName      String
  phone         String?
  address       String?
  profilePic    String?
  role          Role      @default(STUDENT)
  status        Status    @default(ACTIVE)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  student       Student?
  teacher       Teacher?
  parent        Parent?
  admin         Admin?
  messages      Message[]
  notifications Notification[]
}

// ============================================
// STUDENT MODEL
// ============================================
model Student {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  rollNumber      String    @unique
  dateOfBirth     DateTime
  guardianName    String
  guardianPhone   String
  
  // Relations
  classEnrollments ClassEnrollment[]
  attendanceRecords AttendanceRecord[]
  marks           Mark[]
  fees            Fee[]
  messages        Message[] @relation("StudentMessages")
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

// ============================================
// TEACHER MODEL
// ============================================
model Teacher {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  employeeId    String    @unique
  qualifications String?
  experience    Int?      // Years of experience
  
  // Relations
  classAssignments ClassAssignment[]
  subjectTeaching SubjectTeaching[]
  timetableSlots TimetableSlot[]
  attendanceRecords AttendanceRecord[]
  marks         Mark[]
  examInvigilators ExamInvigilator[]
  messages      Message[] @relation("TeacherMessages")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// PARENT MODEL
// ============================================
model Parent {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  occupation    String?
  children      Student[] // Can have multiple children
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// ADMIN MODEL
// ============================================
model Admin {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  permissions   String[]  // Admin-level permissions
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// CLASS MODEL
// ============================================
model Class {
  id              String    @id @default(cuid())
  name            String    // e.g., "Class 10-A"
  section         String    // e.g., "A", "B", "C"
  capacity        Int
  academicYear    String    // e.g., "2024-2025"
  
  // Relations
  enrollments     ClassEnrollment[]
  assignments     ClassAssignment[]
  timetableSlots  TimetableSlot[]
  subjects        Subject[]
  exams           Exam[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([name, academicYear])
}

// ============================================
// SUBJECT MODEL
// ============================================
model Subject {
  id            String    @id @default(cuid())
  name          String
  code          String    @unique
  
  // Relations
  classes       Class[]
  teachers      SubjectTeaching[]
  marks         Mark[]
  timetableSlots TimetableSlot[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// ATTENDANCE MODEL
// ============================================
model AttendanceRecord {
  id            String    @id @default(cuid())
  date          DateTime
  status        AttendanceStatus // PRESENT, ABSENT, LEAVE
  remarks       String?
  isStudent     Boolean   // true=student, false=teacher
  
  // Relations
  studentId     String?
  student       Student?  @relation(fields: [studentId], references: [id])
  teacherId     String?
  teacher       Teacher?  @relation(fields: [teacherId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([studentId, date])
  @@index([teacherId, date])
}

// ============================================
// MARK MODEL
// ============================================
model Mark {
  id            String    @id @default(cuid())
  marks         Float
  totalMarks    Float
  percentage    Float
  grade         String?   // A, B, C, D, F
  remarks       String?
  
  // Relations
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  teacherId     String
  teacher       Teacher   @relation(fields: [teacherId], references: [id])
  examId        String
  exam          Exam      @relation(fields: [examId], references: [id])
  subjectId     String
  subject       Subject   @relation(fields: [subjectId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([studentId, examId, subjectId])
}

// ============================================
// EXAM MODEL
// ============================================
model Exam {
  id            String    @id @default(cuid())
  name          String    // e.g., "Midterm", "Final"
  startDate     DateTime
  endDate       DateTime
  type          ExamType
  
  // Relations
  classId       String
  class         Class     @relation(fields: [classId], references: [id])
  subjects      Subject[]
  timetables    ExamTimetable[]
  marks         Mark[]
  invigilators  ExamInvigilator[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// ============================================
// EXAM TIMETABLE MODEL
// ============================================
model ExamTimetable {
  id            String    @id @default(cuid())
  date          DateTime
  startTime     DateTime
  endTime       DateTime
  room          String
  
  // Relations
  examId        String
  exam          Exam      @relation(fields: [examId], references: [id])
  subjectId     String
  subject       Subject   @relation(fields: [subjectId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([examId, date])
}

// ============================================
// TIMETABLE SLOT MODEL
// ============================================
model TimetableSlot {
  id            String    @id @default(cuid())
  dayOfWeek     Int       // 1=Monday, 7=Sunday
  periodNumber  Int       // 1, 2, 3, etc.
  startTime     String    // "9:00"
  endTime       String    // "10:00"
  room          String
  
  // Relations
  classId       String
  class         Class     @relation(fields: [classId], references: [id])
  teacherId     String
  teacher       Teacher   @relation(fields: [teacherId], references: [id])
  subjectId     String
  subject       Subject   @relation(fields: [subjectId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // No two classes in same room at same time
  @@unique([classId, dayOfWeek, periodNumber])
}

// ============================================
// FEE MODEL
// ============================================
model Fee {
  id            String    @id @default(cuid())
  amount        Float
  dueDate       DateTime
  paidDate      DateTime?
  status        PaymentStatus // PENDING, PAID, OVERDUE
  feeType       String    // "Tuition", "Bus", "Uniform", etc.
  
  // Relations
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([studentId, status])
}

// ============================================
// MESSAGE MODEL
// ============================================
model Message {
  id            String    @id @default(cuid())
  content       String
  isRead        Boolean   @default(false)
  
  // Relations
  senderId      String
  sender        User      @relation(fields: [senderId], references: [id])
  
  studentId     String?
  student       Student?  @relation("StudentMessages", fields: [studentId], references: [id])
  
  teacherId     String?
  teacher       Teacher?  @relation("TeacherMessages", fields: [teacherId], references: [id])
  
  conversationId String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([conversationId, createdAt])
}

// ============================================
// ANNOUNCEMENT MODEL
// ============================================
model Announcement {
  id            String    @id @default(cuid())
  title         String
  content       String
  priority      Priority  // HIGH, MEDIUM, LOW
  targetRole    Role?     // If null, visible to all
  
  // Relations
  createdById   String
  createdBy     User      @relation(fields: [createdById], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([createdAt])
}

// ============================================
// NOTIFICATION MODEL
// ============================================
model Notification {
  id            String    @id @default(cuid())
  title         String
  message       String
  isRead        Boolean   @default(false)
  type          NotificationType
  
  // Relations
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([userId, createdAt])
}

// ============================================
// CLASS ENROLLMENT MODEL (Junction table)
// ============================================
model ClassEnrollment {
  id            String    @id @default(cuid())
  enrollmentDate DateTime
  
  // Relations
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  classId       String
  class         Class     @relation(fields: [classId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([studentId, classId])
}

// ============================================
// CLASS ASSIGNMENT MODEL (Junction table)
// ============================================
model ClassAssignment {
  id            String    @id @default(cuid())
  assignmentDate DateTime
  
  // Relations
  teacherId     String
  teacher       Teacher   @relation(fields: [teacherId], references: [id])
  classId       String
  class         Class     @relation(fields: [classId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([teacherId, classId])
}

// ============================================
// SUBJECT TEACHING MODEL (Junction table)
// ============================================
model SubjectTeaching {
  id            String    @id @default(cuid())
  
  // Relations
  teacherId     String
  teacher       Teacher   @relation(fields: [teacherId], references: [id])
  subjectId     String
  subject       Subject   @relation(fields: [subjectId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([teacherId, subjectId])
}

// ============================================
// EXAM INVIGILATOR MODEL (Junction table)
// ============================================
model ExamInvigilator {
  id            String    @id @default(cuid())
  
  // Relations
  teacherId     String
  teacher       Teacher   @relation(fields: [teacherId], references: [id])
  examId        String
  exam          Exam      @relation(fields: [examId], references: [id])
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@unique([teacherId, examId])
}

// ============================================
// ENUMS
// ============================================
enum Role {
  ADMIN
  TEACHER
  STUDENT
  PARENT
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LEAVE
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
}

enum ExamType {
  MIDTERM
  FINAL
  QUARTERLY
  UNIT_TEST
  MOCK
}

enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum NotificationType {
  ATTENDANCE
  MARKS
  FEE
  ANNOUNCEMENT
  MESSAGE
  EXAM
  TIMETABLE
  ASSIGNMENT
}
```

---

## 📦 IMPLEMENTATION SEQUENCE (START HERE!)

### **PHASE 1: FOUNDATION (Weeks 1-2)**

#### **Module 1: Setup & Authentication** ⭐ START HERE!
**Duration:** 3-4 days

**What you'll build:**
- Project initialization
- Database connection
- User registration (all roles)
- User login with JWT
- Password reset functionality
- Role-based middleware

**Key files to create:**
```
pages/api/auth/login.ts
pages/api/auth/register.ts
pages/api/auth/logout.ts
pages/auth/login.tsx
pages/auth/register.tsx
lib/auth.ts
lib/jwt.ts
hooks/useAuth.ts
middleware/auth.ts
```

**Testing:**
- ✅ Register as Admin
- ✅ Register as Teacher
- ✅ Register as Student
- ✅ Register as Parent
- ✅ Login with credentials
- ✅ Logout functionality
- ✅ Token refresh

---

#### **Module 2: Core Master Data** 
**Duration:** 4-5 days

**What you'll build:**
- Student management (CRUD)
- Teacher management (CRUD)
- Class management (CRUD)
- Subject management (CRUD)

**Key files to create:**
```
pages/api/students/index.ts
pages/api/students/[id].ts
pages/api/teachers/index.ts
pages/api/classes/index.ts
pages/api/subjects/index.ts
pages/admin/students/index.tsx
components/Forms/StudentForm.tsx
components/Tables/StudentTable.tsx
```

**Testing:**
- ✅ Add students
- ✅ Edit student info
- ✅ Delete students
- ✅ Add teachers
- ✅ Create classes
- ✅ Assign subjects

---

### **PHASE 2: CORE OPERATIONS (Weeks 3-5)**

#### **Module 3: Attendance System**
**Duration:** 3-4 days

**What you'll build:**
- Student attendance marking
- Teacher attendance marking
- Attendance reports
- Notifications for absences

**Key files to create:**
```
pages/api/attendance/mark-student.ts
pages/api/attendance/mark-teacher.ts
pages/api/attendance/get-report.ts
pages/teacher/attendance/index.tsx
components/Forms/AttendanceForm.tsx
```

---

#### **Module 4: Academics & Marks**
**Duration:** 4-5 days

**What you'll build:**
- Mark entry for exams
- Grade calculation
- Report card generation
- GPA calculation

**Key files to create:**
```
pages/api/academics/mark-entry.ts
pages/api/academics/get-report-card.ts
pages/api/academics/calculate-gpa.ts
pages/teacher/marks/index.tsx
components/Forms/MarksForm.tsx
```

---

#### **Module 5: Exam Management**
**Duration:** 3-4 days

**What you'll build:**
- Exam creation
- Exam timetable
- Invigilator assignment
- Result publication

**Key files to create:**
```
pages/api/exams/index.ts
pages/api/exams/create-timetable.ts
pages/admin/exams/index.tsx
components/Forms/ExamForm.tsx
```

---

### **PHASE 3: SCHEDULES & COMMUNICATION (Weeks 5-6)**

#### **Module 6: Timetable System**
**Duration:** 4-5 days

**What you'll build:**
- Class timetable creation
- Teacher timetable
- Conflict detection
- Substitute teacher assignment

**Key files to create:**
```
pages/api/timetable/create-class-timetable.ts
pages/api/timetable/detect-conflicts.ts
pages/admin/timetable/index.tsx
components/Tables/TimetableTable.tsx
```

---

#### **Module 7: Communication System**
**Duration:** 3-4 days

**What you'll build:**
- Announcements board
- Parent-Teacher messaging
- Notifications system
- Message history

**Key files to create:**
```
pages/api/communication/announcements/index.ts
pages/api/communication/messages/send.ts
pages/api/communication/notifications/send.ts
pages/admin/communication/index.tsx
```

---

### **PHASE 4: FINANCIAL & REPORTS (Weeks 7-8)**

#### **Module 8: Fee Management**
**Duration:** 3-4 days

**What you'll build:**
- Fee structure setup
- Invoice generation
- Payment tracking
- Payment reminders
- Outstanding fees report

**Key files to create:**
```
pages/api/fees/structure/index.ts
pages/api/fees/invoices/generate.ts
pages/api/fees/payments/record.ts
pages/admin/fees/index.tsx
```

---

#### **Module 9: Reports & Analytics**
**Duration:** 3-4 days

**What you'll build:**
- Attendance reports
- Academic reports
- Financial reports
- Export functionality (PDF/Excel)

**Key files to create:**
```
pages/api/reports/attendance.ts
pages/api/reports/academic.ts
pages/api/reports/financial.ts
pages/admin/reports/index.tsx
```

---

### **PHASE 5: DASHBOARDS & DEPLOYMENT (Weeks 8-10)**

#### **Module 10: Role-Based Dashboards**
**Duration:** 3-4 days

**What you'll build:**
- Admin dashboard (stats, charts)
- Teacher dashboard
- Student dashboard
- Parent dashboard

**Key files to create:**
```
components/Dashboards/AdminDashboard.tsx
components/Dashboards/TeacherDashboard.tsx
components/Dashboards/StudentDashboard.tsx
components/Dashboards/ParentDashboard.tsx
pages/admin/index.tsx
pages/teacher/index.tsx
pages/student/index.tsx
pages/parent/index.tsx
```

---

#### **Module 11: PWA & Mobile Setup**
**Duration:** 2-3 days

**What you'll build:**
- Service worker
- Offline functionality
- Push notifications
- Install prompt
- Mobile optimization

**Key files to create:**
```
public/manifest.json
public/service-worker.js
public/icon-192.png
public/icon-512.png
lib/pwa.ts
```

---

#### **Module 12: Testing & Deployment**
**Duration:** 3-4 days

**What you'll build:**
- Unit tests
- API tests
- Deployment to Vercel
- Production setup

---

## 🚀 SETUP COMMANDS (COPY & PASTE!)

```bash
# Step 1: Create Next.js Project
npx create-next-app@latest school-management-cms \
  --typescript \
  --tailwind \
  --eslint \
  --app=false \
  --import-alias=@/*

cd school-management-cms

# Step 2: Install Dependencies
npm install

npm install \
  @prisma/client@latest \
  @prisma/cli@latest \
  next-auth@beta \
  bcryptjs \
  jsonwebtoken \
  axios \
  react-query \
  zustand \
  date-fns \
  zod \
  react-hook-form \
  next-pwa

# Step 3: Dev Dependencies
npm install -D \
  prisma \
  typescript \
  @types/node \
  @types/react \
  jest \
  @testing-library/react

# Step 4: Initialize Prisma
npx prisma init

# Step 5: Create .env.local file
# (Configure your database URL)

# Step 6: Create database schema
# (Copy the schema.prisma content)

# Step 7: Run migrations
npx prisma migrate dev --name init

# Step 8: Generate Prisma Client
npx prisma generate

# Step 9: Seed database (optional)
npx prisma db seed

# Step 10: Start development server
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 Success Checklist

### By Week 1:
- ✅ Project created and running
- ✅ Database connected
- ✅ Authentication working
- ✅ Can login/register/logout

### By Week 2:
- ✅ Student management complete
- ✅ Teacher management complete
- ✅ Class management complete
- ✅ Basic CRUD operations working

### By Week 4:
- ✅ Attendance system working
- ✅ Marks entry working
- ✅ Report cards generating

### By Week 6:
- ✅ Timetable system working
- ✅ Communication system working
- ✅ Messaging between parents & teachers

### By Week 8:
- ✅ Fee management working
- ✅ Reports generating
- ✅ All dashboards functional

### By Week 10:
- ✅ PWA working
- ✅ Offline mode functional
- ✅ Deployed on Vercel
- ✅ Mobile app ready

---

## 📱 PWA Features

- **Install:** Users can install as app from home screen
- **Offline:** Works without internet
- **Sync:** Automatically syncs when back online
- **Push Notifications:** Send alerts to users
- **Fast:** Caches app for instant loading
- **Responsive:** Works on all devices

---

## 🔐 Security Features

- JWT authentication
- Password hashing (bcryptjs)
- SQL injection prevention (Prisma)
- XSS prevention (Next.js)
- CSRF protection
- Role-based access control
- Data encryption
- Activity logging

---

## 🚀 Deployment to Vercel

```bash
# Login to Vercel
npm install -g vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - JWT_SECRET
```

**Your app will be live at:** `https://your-app-name.vercel.app`

---

## 📊 Technology Stack Summary

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18 | Component-based UI |
| **Backend** | Next.js 14 | API routes + frontend |
| **Database** | PostgreSQL | Reliable, scalable |
| **ORM** | Prisma | Type-safe queries |
| **Auth** | NextAuth | Built for Next.js |
| **Styling** | Tailwind CSS | Utility-first, responsive |
| **PWA** | Service Worker | Offline + install |
| **Deployment** | Vercel | 1-click deploy, auto-scaling |
| **State** | Zustand | Simple state management |
| **Forms** | React Hook Form | Easy form handling |
| **Validation** | Zod | Type-safe validation |

---

## 📞 Next Steps

1. ✅ Read this entire document
2. ✅ Run the setup commands above
3. ✅ Start with Module 1 (Authentication)
4. ✅ Follow the sequence step-by-step
5. ✅ Test each module before moving to next
6. ✅ Deploy to Vercel when all 12 modules complete

---

**Created:** September 2026  
**Version:** 1.0-Complete  
**Status:** Ready for Implementation  

**Let's build SchoolHub! 🚀**
