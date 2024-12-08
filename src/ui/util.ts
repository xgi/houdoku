export function cn(...classNames: (string | boolean | undefined)[]) {
  return classNames.join(' ');
}
