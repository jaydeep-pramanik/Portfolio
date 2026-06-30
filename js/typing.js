/**
 * typing.js — Typewriter effect for the hero section
 */

(function () {
  const WORDS = [
    'Web Developer',
    'HTML & CSS Expert',
    'JavaScript Developer',
    'Frontend Designer'
  ];

  const el = document.getElementById('typed-text');
  if (!el) return;

  let wordIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

  function type() {
    const word = WORDS[wordIndex];

    if (isDeleting) {
      el.textContent = word.substring(0, charIndex - 1);
      charIndex--;
    } else {
      el.textContent = word.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === word.length) {
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex  = (wordIndex + 1) % WORDS.length;
      delay = 400;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 1200);
})();
