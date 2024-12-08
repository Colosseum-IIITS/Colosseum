'use client'
// components/withAuth.js
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
const withAuth = (WrappedComponent, allowedRoles) => {
  return (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (loading) return; // Wait for loading to complete
      if (!user || !allowedRoles.includes(user.role)) {
        // Redirect user if they don't have permission
        router.push('/unauthorized');
      }
    }, [user, loading]);

    

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
