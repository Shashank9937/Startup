import { useEffect } from 'react';

export function useKeyboardShortcuts(enabled, handlers) {
  useEffect(() => {
    if (!enabled) return undefined;

    function onKeyDown(event) {
      if (event.target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      const combo = `${event.metaKey || event.ctrlKey ? 'mod+' : ''}${event.shiftKey ? 'shift+' : ''}${key}`;
      if (handlers[combo]) {
        event.preventDefault();
        handlers[combo]();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, handlers]);
}
