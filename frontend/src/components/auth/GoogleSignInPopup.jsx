import React, { useRef, useEffect } from 'react';
import { BACKEND_API } from '../../lib/apiConfig';

export default function GoogleSignInPopup({
  redirect,
  label = 'Sign in with Google',
  onSuccess,
  onError,
  className,
  children,
}) {
  const popupRef = useRef(null);
  const messageHandlerRef = useRef(null);
  const pollRef = useRef(null);

  const popupFeatures = (w = 500, h = 650) => {
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    return `width=${w},height=${h},left=${left},top=${top}`;
  };

  const cleanup = () => {
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
      messageHandlerRef.current = null;
    }
    if (popupRef.current && !popupRef.current.closed) {
      try { popupRef.current.close(); } catch (e) {}
      popupRef.current = null;
    }
    if (pollRef.current) {
      clearTimeout(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const handleMessage = (ev) => {
    try {
      if (!ev || !ev.data) return;
      if (ev.data.type === 'oauth' && ev.data.user) {
        try { localStorage.setItem('userData', JSON.stringify(ev.data.user)); } catch (e) {}
        try { window.dispatchEvent(new CustomEvent('user-data-changed', { detail: ev.data.user })); } catch (e) {}
        onSuccess && onSuccess(ev.data.user);
        cleanup();
      }
    } catch (err) {
      onError && onError(err);
      cleanup();
    }
  };

  const handleClick = () => {
    // Register listener before opening the popup to avoid race where the
    // popup posts a message before this window has attached the handler.
    messageHandlerRef.current = handleMessage;
    window.addEventListener('message', messageHandlerRef.current);

    try {
      const redirectUrl = redirect || `${BACKEND_API}/api/auth/google`;
      popupRef.current = window.open(redirectUrl, 'google_oauth', popupFeatures());
    } catch (err) {
      // cleanup if opening popup fails
      cleanup();
      onError && onError(err);
      return;
    }

    let pollCount = 0;
    const maxPolls = 120; // ~2 minutes

    const checkPopupClosed = () => {
      pollCount++;
      if (popupRef.current && popupRef.current.closed) {
        cleanup();
        return;
      }
      if (pollCount < maxPolls) {
        pollRef.current = setTimeout(checkPopupClosed, 1000);
      } else {
        cleanup();
      }
    };

    checkPopupClosed();
  };

  // If a className is provided, prefer it so styling can be controlled by callers
  if (className) {
    return (
      <button onClick={handleClick} className={className}>
        {children ? children : (
          <>
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.8 2.9 30.2 0 24 0 14 0 5.6 5.6 1.9 13.6l7.98 6.2C11.9 14.1 17.4 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.5 24.5c0-1.6-.14-3.1-.4-4.5H24v8.5h12.8c-.55 3-2.4 5.6-5.4 7.2l8.2 6.3C44.8 37.1 46.5 31.3 46.5 24.5z"/>
              <path fill="#4A90E2" d="M10.9 28.3A14.6 14.6 0 0 1 10.2 24c0-1.3.2-2.6.5-3.8L2.7 14C1 17.9 0 21.9 0 26c0 4 1 7.9 2.7 11.8l8.2-6.5z"/>
              <path fill="#FBBC05" d="M24 48c6.2 0 11.9-2.1 16.1-5.7l-8.2-6.3C30.7 35.9 27.5 37 24 37c-6.6 0-12.1-4.6-14.12-10.8L1.9 34.4C5.6 42.4 14 48 24 48z"/>
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  // Default inline-styled button when no className is provided
  return (
    <button onClick={handleClick} style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderRadius: 6,
      border: '1px solid #ddd',
      background: '#fff',
      cursor: 'pointer'
    }}>
      <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.22l6.9-6.9C35.8 2.9 30.2 0 24 0 14 0 5.6 5.6 1.9 13.6l7.98 6.2C11.9 14.1 17.4 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.5 24.5c0-1.6-.14-3.1-.4-4.5H24v8.5h12.8c-.55 3-2.4 5.6-5.4 7.2l8.2 6.3C44.8 37.1 46.5 31.3 46.5 24.5z"/>
        <path fill="#4A90E2" d="M10.9 28.3A14.6 14.6 0 0 1 10.2 24c0-1.3.2-2.6.5-3.8L2.7 14C1 17.9 0 21.9 0 26c0 4 1 7.9 2.7 11.8l8.2-6.5z"/>
        <path fill="#FBBC05" d="M24 48c6.2 0 11.9-2.1 16.1-5.7l-8.2-6.3C30.7 35.9 27.5 37 24 37c-6.6 0-12.1-4.6-14.12-10.8L1.9 34.4C5.6 42.4 14 48 24 48z"/>
      </svg>
      <span>{label}</span>
    </button>
  );
}
