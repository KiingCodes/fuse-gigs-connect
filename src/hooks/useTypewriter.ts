import { useEffect, useState } from "react";

/**
 * Cycles through phrases with a typewriter effect.
 * Returns the current animated string suitable for an input placeholder.
 */
export const useTypewriter = (
  phrases: string[],
  options?: { typeSpeed?: number; deleteSpeed?: number; pauseMs?: number }
) => {
  const { typeSpeed = 70, deleteSpeed = 35, pauseMs = 1500 } = options || {};
  const [text, setText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!phrases.length) return;
    const current = phrases[phraseIdx % phrases.length];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
      return;
    }
    const t = setTimeout(
      () => {
        setText((prev) =>
          deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
        );
      },
      deleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(t);
  }, [text, deleting, phraseIdx, phrases, typeSpeed, deleteSpeed, pauseMs]);

  return text;
};
