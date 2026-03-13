'use client';
import { useEffect } from 'react';

export default function PreloaderDismiss() {
  useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      setTimeout(() => preloader.classList.add('loaded'), 500);
    }
  }, []);

  return null;
}
