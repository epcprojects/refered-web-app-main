import { Shortcuts, ShortcutsType } from '@/constants/shortcuts.constants';
import { useHotkeys } from 'react-hotkeys-hook';

export const useHotkey = (key: ShortcutsType, callback: () => void) => {
  useHotkeys([Shortcuts[key].MAC, Shortcuts[key].WIN], callback);
};
