import { IProfile } from '@/firebase/profile';
import type { ConfirmationResult, EmailAuthCredential, User } from 'firebase/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type GlobalState = {
  isTemporarySignin: boolean;
  isResetPasswordSignin: boolean;
  isVerifiedRecently: boolean;
  emailAuthCredential: EmailAuthCredential | null;
  currentUser: User | null;
  currentUserProfile: IProfile | null;
  notificationsCount: number;
  messagesCount: number;
  confirmationResult: ConfirmationResult | null;
};

type GlobalActions = {
  setCurrentUserAndProfile: (data: { user: GlobalState['currentUser']; profile: GlobalState['currentUserProfile'] }) => void;
  setCurrentUserProfile: (data: { profile: GlobalState['currentUserProfile'] }) => void;
  setIsTemporarySignin: (val: boolean) => void;
  setIsResetPasswordSignin: (val: boolean) => void;
  setConfirmationResult: (val: ConfirmationResult | null) => void;
  resetIsVerifiedRecently: () => void;
  resetNotificationsCount: () => void;
  updateNotificationsCount: (val: number) => void;
  resetMessagesCount: () => void;
  updateMessagesCount: (val: number) => void;
};

type GlobalStore = GlobalState & GlobalActions;
export type PersistedGlobalState = Pick<GlobalState, 'currentUser' | 'currentUserProfile' | 'isResetPasswordSignin' | 'isTemporarySignin'>;

export const globalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      isTemporarySignin: false,
      isResetPasswordSignin: false,
      isVerifiedRecently: false,
      emailAuthCredential: null,
      currentUser: null,
      currentUserProfile: null,
      notificationsCount: 0,
      messagesCount: 0,
      confirmationResult: null,
      setCurrentUserAndProfile: (data: { user: GlobalState['currentUser']; profile: GlobalState['currentUserProfile'] }) => set({ currentUser: data.user, currentUserProfile: data.profile }),
      setCurrentUserProfile: (data: { profile: GlobalState['currentUserProfile'] }) => set({ currentUserProfile: data.profile }),
      setIsTemporarySignin: (val: boolean) => set({ isTemporarySignin: val }),
      setIsResetPasswordSignin: (val: boolean) => set({ isResetPasswordSignin: val }),
      resetIsVerifiedRecently: () => set({ isVerifiedRecently: false }),
      resetNotificationsCount: () => set({ notificationsCount: 0 }),
      updateNotificationsCount: (val: number) => set({ notificationsCount: val }),
      resetMessagesCount: () => set({ messagesCount: 0 }),
      updateMessagesCount: (val: number) => set({ messagesCount: val }),
      setConfirmationResult: (val: ConfirmationResult | null) => set({ confirmationResult: val }),
    }),
    {
      name: 'global',
      partialize: (state) => {
        const persist: PersistedGlobalState = { currentUser: state.currentUser, currentUserProfile: state.currentUserProfile, isResetPasswordSignin: state.isResetPasswordSignin, isTemporarySignin: state.isTemporarySignin };
        return persist;
      },
    },
  ),
);
