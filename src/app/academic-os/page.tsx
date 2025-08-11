import { redirect } from 'next/navigation';

export default function AcademicOSPage() {
  // Redirect to dashboard which contains the full Academic OS experience
  redirect('/dashboard');
}