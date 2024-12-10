'use client'

import React, { Suspense } from 'react';
import { UserProvider } from '@/context/UserContext';
import ProfilePicture from '@/components/player/settings/ProfilePicture';
import UsernameForm from '@/components/player/settings/UsernameForm';
import EmailForm from '@/components/player/settings/EmailForm';
import PasswordForm from '@/components/player/settings/PasswordForm';
import TeamActions from '@/components/player/settings/TeamActions';
import { Skeleton } from "@/components/ui/skeleton"

function LoadingFallback() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export default function ProfileSettings() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mt-[170px] mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-shrink-0 p-8">
              <ProfilePicture />
            </div>
            <div className="p-8 w-full">
              <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
              <Suspense fallback={<LoadingFallback />}>
                <div className="space-y-8">
                  <UsernameForm />
                  <EmailForm />
                  <PasswordForm />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </UserProvider>
  );
}

