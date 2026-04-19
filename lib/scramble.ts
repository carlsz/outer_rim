export const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@!%▓░▒";

export function scrambleReveal(
  target: string,
  setter: (s: string) => void,
  onDone?: () => void
) {
  const len = target.length;
  let frame = 0;
  const id = setInterval(() => {
    frame++;
    const locked = Math.floor(frame / 3);
    const display = target
      .split("")
      .map((ch, i) => {
        if (i < locked) return ch;
        if (ch === " " || ch === "·" || ch === ",") return ch;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      })
      .join("");
    setter(display);
    if (locked >= len) {
      clearInterval(id);
      setter(target);
      onDone?.();
    }
  }, 35);
}
