-- ============================================================
-- Move User.role and Announcement.targetRole off the fixed "Role" enum
-- and capture their current values in plain TEXT before the enum type
-- is dropped (it must be dropped before a table named "Role" can be
-- created, since Postgres puts row types and enum types in the same
-- namespace).
-- ============================================================

ALTER TABLE "User" ADD COLUMN "roleKeyTmp" TEXT;
UPDATE "User" SET "roleKeyTmp" = "role"::TEXT;
ALTER TABLE "User" DROP COLUMN "role";

ALTER TABLE "Announcement" ALTER COLUMN "targetRole" TYPE TEXT USING "targetRole"::TEXT;

DROP TYPE "Role";

-- ============================================================
-- RBAC: Role / Permission / RolePermission tables
-- ============================================================

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_key_key" ON "Role"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- Seed the 5 system roles (mirror the original Role enum values,
-- plus a new SUPER_ADMIN tier) and the permission catalog, derived
-- from the modules and role checks that already existed in the app.
-- ============================================================

INSERT INTO "Role" ("id", "key", "name", "description", "isSystem", "createdAt", "updatedAt") VALUES
('role-super-admin', 'SUPER_ADMIN', 'Super Admin', 'Full administrative control over the entire system, including roles and permissions.', true, NOW(), NOW()),
('role-admin',       'ADMIN',       'Admin',       'Manages day-to-day school operations: users, students, teachers, classes, academics, fees, communication and reports.', true, NOW(), NOW()),
('role-teacher',     'TEACHER',     'Teacher',     'Manages attendance, marks, timetable and communication for their own classes.', true, NOW(), NOW()),
('role-student',     'STUDENT',     'Student',     'Views their own attendance, marks, timetable, fees and messages.', true, NOW(), NOW()),
('role-parent',      'PARENT',      'Parent',      'Views their linked children''s attendance, marks, timetable and fees.', true, NOW(), NOW());

INSERT INTO "Permission" ("id", "key", "module", "action", "description", "createdAt") VALUES
('perm-users-view',            'users.view',            'users',        'view',           'View the list and detail of user accounts', NOW()),
('perm-users-create',          'users.create',          'users',        'create',         'Create new user accounts', NOW()),
('perm-users-edit',            'users.edit',            'users',        'edit',           'Edit user account details and status', NOW()),
('perm-users-delete',          'users.delete',          'users',        'delete',         'Deactivate or suspend user accounts', NOW()),
('perm-users-change-password', 'users.changePassword',  'users',        'changePassword', 'Reset another user''s password', NOW()),
('perm-users-assign-role',     'users.assignRole',      'users',        'assignRole',     'Change a user''s assigned role', NOW()),
('perm-roles-view',            'roles.view',             'roles',        'view',           'View roles and their permissions', NOW()),
('perm-roles-create',          'roles.create',           'roles',        'create',         'Create custom roles', NOW()),
('perm-roles-edit',            'roles.edit',              'roles',        'edit',           'Edit roles and their permission assignments', NOW()),
('perm-roles-delete',          'roles.delete',            'roles',        'delete',         'Delete non-system roles', NOW()),
('perm-permissions-view',      'permissions.view',       'permissions',  'view',           'View the system permission catalog', NOW()),
('perm-students-create',       'students.create',        'students',     'create',         'Add new students', NOW()),
('perm-students-edit',         'students.edit',          'students',     'edit',           'Edit student records', NOW()),
('perm-students-delete',       'students.delete',        'students',     'delete',         'Delete student records', NOW()),
('perm-teachers-create',       'teachers.create',        'teachers',     'create',         'Add new teachers', NOW()),
('perm-teachers-edit',         'teachers.edit',           'teachers',     'edit',           'Edit teacher records', NOW()),
('perm-teachers-delete',       'teachers.delete',         'teachers',     'delete',         'Delete teacher records', NOW()),
('perm-classes-create',        'classes.create',         'classes',      'create',         'Create classes', NOW()),
('perm-classes-edit',          'classes.edit',            'classes',      'edit',           'Edit classes and manage class rosters', NOW()),
('perm-classes-delete',        'classes.delete',          'classes',      'delete',         'Delete classes', NOW()),
('perm-subjects-create',       'subjects.create',        'subjects',     'create',         'Create subjects', NOW()),
('perm-subjects-edit',         'subjects.edit',           'subjects',     'edit',           'Edit subjects', NOW()),
('perm-subjects-delete',       'subjects.delete',         'subjects',     'delete',         'Delete subjects', NOW()),
('perm-attendance-mark',       'attendance.mark',        'attendance',   'mark',           'Mark student attendance', NOW()),
('perm-attendance-manage',     'attendance.manage',      'attendance',   'manage',         'Mark teacher attendance', NOW()),
('perm-marks-enter',           'marks.enter',             'marks',        'enter',          'Enter student marks', NOW()),
('perm-marks-publish',         'marks.publish',           'marks',        'publish',        'Publish exam results', NOW()),
('perm-exams-create',          'exams.create',            'exams',        'create',         'Create exams', NOW()),
('perm-exams-edit',            'exams.edit',               'exams',        'edit',           'Edit exams, timetables and invigilators', NOW()),
('perm-exams-delete',          'exams.delete',             'exams',        'delete',         'Delete exams', NOW()),
('perm-timetable-manage',      'timetable.manage',        'timetable',    'manage',         'Create and manage class timetables', NOW()),
('perm-announcements-manage',  'announcements.manage',    'announcements','manage',         'Create, edit and delete announcements', NOW()),
('perm-notifications-send',    'notifications.send',      'notifications','send',           'Send notifications to users', NOW()),
('perm-fees-manage',           'fees.manage',              'fees',         'manage',         'Manage fee structures, invoices, payments and reminders', NOW()),
('perm-fees-view-reports',     'fees.viewReports',        'fees',         'viewReports',    'View outstanding fees reports', NOW()),
('perm-reports-view',          'reports.view',             'reports',      'view',           'View attendance and academic reports', NOW()),
('perm-reports-export',        'reports.export',           'reports',      'export',         'Export reports', NOW()),
('perm-reports-view-financial','reports.viewFinancial',   'reports',      'viewFinancial',  'View financial reports', NOW());

-- SUPER_ADMIN gets every permission in the catalog.
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-super-admin-' || p."id", 'role-super-admin', p."id", NOW() FROM "Permission" p;

-- ADMIN gets every permission that already required the ADMIN role today,
-- plus the new user-management module, minus role/permission CRUD (which
-- stays Super-Admin-only by default and can be granted explicitly later).
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-admin-' || p."id", 'role-admin', p."id", NOW()
FROM "Permission" p
WHERE p."key" NOT IN ('roles.create', 'roles.edit', 'roles.delete');

-- TEACHER keeps exactly the capabilities that already allowed the TEACHER
-- role alongside ADMIN in the old hardcoded checks.
INSERT INTO "RolePermission" ("id", "roleId", "permissionId", "createdAt")
SELECT 'rp-teacher-' || p."id", 'role-teacher', p."id", NOW()
FROM "Permission" p
WHERE p."key" IN ('attendance.mark', 'marks.enter', 'announcements.manage', 'reports.view', 'reports.export');

-- STUDENT and PARENT have no operational permissions — their portals only
-- ever used self-scoped "/me" endpoints and ownership checks, unaffected
-- by this permission system.

-- ============================================================
-- Migrate User.role (enum) -> User.roleId (FK to Role), preserving
-- every existing user's access exactly.
-- ============================================================

ALTER TABLE "User" ADD COLUMN "roleId" TEXT;

UPDATE "User" u SET "roleId" = r."id"
FROM "Role" r
WHERE r."key" = u."roleKeyTmp";

ALTER TABLE "User" ALTER COLUMN "roleId" SET NOT NULL;

ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "User_roleId_idx" ON "User"("roleId");

ALTER TABLE "User" DROP COLUMN "roleKeyTmp";

-- Admin.permissions was dead scaffolding (never read anywhere in the app);
-- real per-role permissions now live in RolePermission.
ALTER TABLE "Admin" DROP COLUMN "permissions";
