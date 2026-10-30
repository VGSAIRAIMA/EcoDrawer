export function isModuleUnlocked(index: number, passed: boolean[]): boolean {
  return index === 0 || passed[index - 1] === true
}

export function passedLevel(score: number, total: number): boolean {
  return total > 0 && score / total >= 0.6
}

export function nextLevel(highestCleared: number): number {
  return Math.min(10, highestCleared + 1)
}

export function calculateScanPoints(correctGuess: boolean, scansToday: number): number {
  if (scansToday >= 5) return 0
  return 15 + (correctGuess ? 10 : 0)
}
