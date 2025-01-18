export type ShortcutsType = keyof typeof Shortcuts;
export const Shortcuts = Object.freeze({
  SEARCH: { MAC: 'meta+k', WIN: 'ctrl+k', MAC_LABEL: ['⌘', 'K'], WIN_LABEL: ['Ctrl', 'K'] },
});
