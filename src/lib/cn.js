export function cn(...args) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .filter((v) => typeof v === 'string')
    .join(' ')
}
