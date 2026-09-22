export function calculatePercentage(marks: number, totalMarks: number): number {
  if (totalMarks <= 0) return 0;
  return Math.round((marks / totalMarks) * 1000) / 10;
}

export function calculateGrade(percentage: number): "A" | "B" | "C" | "D" | "F" {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}

const GRADE_POINTS: Record<string, number> = { A: 4.0, B: 3.0, C: 2.0, D: 1.0, F: 0.0 };

export function calculateGPA(grades: string[]): number {
  if (grades.length === 0) return 0;
  const points = grades.reduce((sum, grade) => sum + (GRADE_POINTS[grade] ?? 0), 0);
  return Math.round((points / grades.length) * 100) / 100;
}
