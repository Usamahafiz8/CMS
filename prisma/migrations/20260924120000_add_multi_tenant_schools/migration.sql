-- Multi-tenant (SaaS) conversion.
-- Every tenant-owned table gains a "schoolId". Any data that existed before
-- this migration is moved into a single "default-school" tenant so nothing is
-- lost; on a fresh database no default school is created.
-- The column default is '' only so Prisma's generated types let app code omit
-- schoolId (lib/db.ts injects it); the CHECK constraints make any write that
-- escapes tenant scoping fail instead of silently creating an orphan row.

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('TRIAL', 'STARTER', 'PRO');

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL DEFAULT 'TRIAL',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "trialEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_slug_key" ON "School"("slug");

-- Backfill tenant for pre-existing data (only if there is any).
INSERT INTO "School" ("id", "name", "slug", "plan", "status", "createdAt", "updatedAt")
SELECT 'default-school', 'My School', 'my-school', 'PRO', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM "User");

-- DropIndex
DROP INDEX "Student_rollNumber_key";

-- DropIndex
DROP INDEX "Teacher_employeeId_key";

-- DropIndex
DROP INDEX "Class_name_section_academicYear_key";

-- DropIndex
DROP INDEX "Subject_code_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "User" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "User" ADD CONSTRAINT "User_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Student" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Student" ADD CONSTRAINT "Student_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Teacher" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "schoolId" TEXT;
-- Existing custom roles belong to the pre-SaaS school; system roles stay shared (NULL).
UPDATE "Role" SET "schoolId" = 'default-school' WHERE "isSystem" = false;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Class" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Class" ADD CONSTRAINT "Class_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Subject" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "AttendanceRecord" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "AttendanceRecord" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Mark" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Mark" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Mark" ADD CONSTRAINT "Mark_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Exam" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "ExamTimetable" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "ExamTimetable" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "ExamTimetable" ADD CONSTRAINT "ExamTimetable_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "TimetableSlot" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "TimetableSlot" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "TimetableSlot" ADD CONSTRAINT "TimetableSlot_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Fee" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Fee" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "FeeStructure" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Message" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Message" ADD CONSTRAINT "Message_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Announcement" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "Notification" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "ClassEnrollment" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "ClassEnrollment" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "ClassEnrollment" ADD CONSTRAINT "ClassEnrollment_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "ClassAssignment" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "ClassAssignment" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "ClassAssignment" ADD CONSTRAINT "ClassAssignment_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "ClassSubject" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "ClassSubject" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "SubjectTeaching" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "SubjectTeaching" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "SubjectTeaching" ADD CONSTRAINT "SubjectTeaching_schoolId_not_empty" CHECK ("schoolId" <> '');

-- AlterTable
ALTER TABLE "ExamInvigilator" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default-school';
ALTER TABLE "ExamInvigilator" ALTER COLUMN "schoolId" SET DEFAULT '';
ALTER TABLE "ExamInvigilator" ADD CONSTRAINT "ExamInvigilator_schoolId_not_empty" CHECK ("schoolId" <> '');


-- CreateIndex
CREATE INDEX "User_schoolId_idx" ON "User"("schoolId");

-- CreateIndex
CREATE INDEX "Student_schoolId_idx" ON "Student"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_schoolId_rollNumber_key" ON "Student"("schoolId", "rollNumber");

-- CreateIndex
CREATE INDEX "Teacher_schoolId_idx" ON "Teacher"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_schoolId_employeeId_key" ON "Teacher"("schoolId", "employeeId");

-- CreateIndex
CREATE INDEX "Role_schoolId_idx" ON "Role"("schoolId");

-- CreateIndex
CREATE INDEX "Class_schoolId_idx" ON "Class"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Class_schoolId_name_section_academicYear_key" ON "Class"("schoolId", "name", "section", "academicYear");

-- CreateIndex
CREATE INDEX "Subject_schoolId_idx" ON "Subject"("schoolId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_schoolId_code_key" ON "Subject"("schoolId", "code");

-- CreateIndex
CREATE INDEX "AttendanceRecord_schoolId_idx" ON "AttendanceRecord"("schoolId");

-- CreateIndex
CREATE INDEX "Mark_schoolId_idx" ON "Mark"("schoolId");

-- CreateIndex
CREATE INDEX "Exam_schoolId_idx" ON "Exam"("schoolId");

-- CreateIndex
CREATE INDEX "ExamTimetable_schoolId_idx" ON "ExamTimetable"("schoolId");

-- CreateIndex
CREATE INDEX "TimetableSlot_schoolId_idx" ON "TimetableSlot"("schoolId");

-- CreateIndex
CREATE INDEX "Fee_schoolId_idx" ON "Fee"("schoolId");

-- CreateIndex
CREATE INDEX "FeeStructure_schoolId_idx" ON "FeeStructure"("schoolId");

-- CreateIndex
CREATE INDEX "Message_schoolId_idx" ON "Message"("schoolId");

-- CreateIndex
CREATE INDEX "Announcement_schoolId_idx" ON "Announcement"("schoolId");

-- CreateIndex
CREATE INDEX "Notification_schoolId_idx" ON "Notification"("schoolId");

-- CreateIndex
CREATE INDEX "ClassEnrollment_schoolId_idx" ON "ClassEnrollment"("schoolId");

-- CreateIndex
CREATE INDEX "ClassAssignment_schoolId_idx" ON "ClassAssignment"("schoolId");

-- CreateIndex
CREATE INDEX "ClassSubject_schoolId_idx" ON "ClassSubject"("schoolId");

-- CreateIndex
CREATE INDEX "SubjectTeaching_schoolId_idx" ON "SubjectTeaching"("schoolId");

-- CreateIndex
CREATE INDEX "ExamInvigilator_schoolId_idx" ON "ExamInvigilator"("schoolId");

