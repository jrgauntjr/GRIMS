import { useEffect, useState } from 'react';
import { fetchDesktopMode, shutdownDesktop } from '../api/desktop.js';
import './DesktopExit.css';

function markDesktopSession() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('desktop') === '1') {
    sessionStorage.setItem('grimsDesktop', '1');
  }
}

export default function DesktopExit() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    markDesktopSession();

    fetchDesktopMode()
      .then((isDesktop) => {
        if (isDesktop) {
          setDesktop(true);
        }
      })
      .catch(() => {});
  }, []);

  async function handleExit() {
    if (!window.confirm('Exit GRIMS? This will close the application.')) {
      return;
    }

    try {
      await shutdownDesktop();
    } catch {
      // The server may stop before the response finishes.
    }

    sessionStorage.removeItem('grimsDesktop');
    window.close();

    document.body.innerHTML =
      '<main style="font-family:sans-serif;text-align:center;margin-top:3rem">' +
      '<h1>GRIMS has exited</h1>' +
      '<p>You can close this window.</p>' +
      '</main>';
  }

  if (!desktop) {
    return null;
  }

  return (
    <button type="button" className="desktop-exit" onClick={handleExit}>
      Exit
    </button>
  );
}
