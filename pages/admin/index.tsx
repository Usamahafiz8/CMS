import AdminLayout from "@/components/Common/AdminLayout";
import StatCard from "@/components/Dashboards/StatCard";
import EnrollmentChart from "@/components/Charts/EnrollmentChart";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { useStudents } from "@/hooks/useStudent";
import { useTeachers } from "@/hooks/useTeacher";
import { useClasses } from "@/hooks/useClass";
import { useSubjects } from "@/hooks/useSubject";
import { useOutstandingFees } from "@/hooks/useFees";
import { formatCurrency } from "@/lib/helpers";

export default function AdminDashboard() {
  const students = useStudents(1, 1);
  const teachers = useTeachers(1, 1);
  const classes = useClasses(1, 100);
  const subjects = useSubjects(1, 1);
  const outstanding = useOutstandingFees();

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Students" value={students.data?.pagination.total ?? "—"} href="/admin/students" />
        <StatCard label="Teachers" value={teachers.data?.pagination.total ?? "—"} href="/admin/teachers" />
        <StatCard label="Classes" value={classes.data?.pagination.total ?? "—"} href="/admin/classes" />
        <StatCard label="Subjects" value={subjects.data?.pagination.total ?? "—"} href="/admin/subjects" />
        <StatCard
          label="Outstanding Fees"
          value={formatCurrency(outstanding.data?.summary.totalOutstanding ?? 0)}
          href="/admin/fees"
        />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Enrollment by Class</h2>
        {classes.isLoading ? (
          <LoadingSpinner label="Loading enrollment..." />
        ) : (
          <EnrollmentChart
            data={(classes.data?.data ?? []).map((c) => ({
              className: `${c.name}-${c.section}`,
              enrolled: c._count.enrollments,
            }))}
          />
        )}
      </div>
    </AdminLayout>
  );
}
