import { useEffect } from 'react';

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 當焦點在輸入框時，不攔截常用的編輯快捷鍵 (全選、複製、貼上、剪下、復原)
      const target = event.target as HTMLElement;
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const isEditingShortcut = ['a', 'c', 'v', 'x', 'z'].includes(event.key.toLowerCase());

      if (isInInput && isEditingShortcut && (event.ctrlKey || event.metaKey)) {
        return; // 讓瀏覽器處理這些快捷鍵
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}
