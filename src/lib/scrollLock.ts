/**
 * Reference-counted scroll lock.
 * Prevents premature scroll unlock when multiple modals are open at once.
 */

let _count = 0;

export function lockScroll(): void {
  _count++;
  if (_count === 1) document.body.style.overflow = "hidden";
}

export function unlockScroll(): void {
  _count = Math.max(0, _count - 1);
  if (_count === 0) document.body.style.overflow = "";
}
