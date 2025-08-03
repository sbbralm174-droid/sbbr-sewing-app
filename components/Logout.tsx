'use client';

import { logOut } from '@/lib/authFunctions';

export default function LogoutButton() {
  return (
    <button onClick={logOut} className="text-sm text-red-500">
      Logout
    </button>
  );
}
