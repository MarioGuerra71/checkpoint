import { redirect } from 'next/navigation';

export default function Page() {
  // Redirect root to /login so the login page is the default landing page
  redirect('/login');
}
