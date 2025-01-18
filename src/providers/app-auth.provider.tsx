'use client';

import { AppPages, isProtectedPath, isPublicPath } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { Signout } from '@/firebase/auth';
import { GetProfileData } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard, isEqual } from '@/utils/lodash.utils';
import { onAuthStateChanged, User } from 'firebase/auth';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface IProps {
  children: React.ReactNode;
}

const AppAuthProvider: React.FC<IProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const globalStore = useAppStore('Global');

  const [user, setUser] = useState<User | null>(globalStore?.currentUser || null);
  const [isAuthenticatingPathname, setsAuthenticatingPathname] = useState(true);
  const [isAuthenticatingUser, setIsAuthenticatingUser] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRedirect = (targetPath: string) => {
    if (pathname === targetPath) return;
    setIsRedirecting(true);
    router.replace(targetPath);
    setTimeout(() => setIsRedirecting(false), 50);
  };

  const handleAuthenticateUser = async (user: User | null) => {
    setIsAuthenticatingUser(true);
    if (user === null && isProtectedPath(pathname)) {
      setUser(null);
      handleRedirect(`${AppPages.SIGNIN}?callback=${pathname}`);
    } else if (user === null && pathname === AppPages.HOME_DEFAULT) {
      setUser(null);
      handleRedirect(`${AppPages.SIGNIN}`);
    } else if (user !== null && globalStore !== null && globalStore.isTemporarySignin === false && globalStore.isResetPasswordSignin === false) {
      const userDataResponse = await asyncGuard(() => GetProfileData({ id: user.uid }));
      if (userDataResponse.error !== null || userDataResponse.result === null) return;
      else if (userDataResponse.result.Verified === '0') setUser(null);
      else {
        setUser(user);
        globalStore.setCurrentUserAndProfile({ user, profile: userDataResponse.result });
      }
    } else if (user !== null && globalStore !== null && globalStore.isResetPasswordSignin) {
      setUser(user);
    }

    setIsAuthenticatingUser(false);
  };

  const handleAuthenticatePathname = () => {
    setsAuthenticatingPathname(true);
    const isAuthenticated = !!user;
    const callbackUrl = searchParams.get('callback');

    if (!isAuthenticated && pathname === AppPages.RESET_PASSWORD) handleRedirect(AppPages.SIGNIN);
    else if (!isAuthenticated && pathname === AppPages.VERIFICATION && (searchParams.get('type') === null || ['signin', 'signup', 'resetPassword'].includes(searchParams.get('type') || '') === false || searchParams.get('phone') === null || (searchParams.get('type') !== 'resetPassword' && globalStore?.emailAuthCredential === null))) handleRedirect(AppPages.SIGNIN);
    else if (!isAuthenticated && isProtectedPath(pathname)) handleRedirect(`${AppPages.SIGNIN}?callback=${pathname}`);
    else if (!isAuthenticated && pathname === AppPages.HOME_DEFAULT) handleRedirect(AppPages.SIGNIN);
    else if (isAuthenticated && globalStore?.isVerifiedRecently) handleRedirect(AppPages.VERIFICATION_SUCCESS);
    else if (isAuthenticated && !globalStore?.isVerifiedRecently && pathname === AppPages.VERIFICATION_SUCCESS) handleRedirect(AppPages.HOME);
    else if (isAuthenticated && !globalStore?.isResetPasswordSignin && isPublicPath(pathname)) handleRedirect(callbackUrl || AppPages.HOME);
    else if (isAuthenticated && isProtectedPath(pathname) && (globalStore?.isResetPasswordSignin || globalStore?.isTemporarySignin)) {
      Signout();
      globalStore.setCurrentUserAndProfile({ user: null, profile: null });
      globalStore.setIsResetPasswordSignin(false);
      setUser(null);
      handleRedirect(AppPages.SIGNIN);
    }

    setsAuthenticatingPathname(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase.auth, handleAuthenticateUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isEqual(user, globalStore?.currentUser || null)) return;
    setUser(globalStore?.currentUser || null);
  }, [globalStore?.currentUser]);

  useEffect(() => {
    if (!isAuthenticatingUser && !isRedirecting) handleAuthenticatePathname();
  }, [pathname, user, isAuthenticatingUser, isRedirecting]);

  if (!isAuthenticatingUser && !isAuthenticatingPathname && !isRedirecting) return <>{children}</>;
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Image src="/images/logo.png" alt="Logo" width={60} height={60} className="animate-page-loader" />
    </div>
  );
};

export default AppAuthProvider;
