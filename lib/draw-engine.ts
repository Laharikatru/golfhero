// Draw Engine — random + algorithmic draw generation

export function generateRandomDraw(): number[] {
  const nums = new Set<number>()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return [...nums].sort((a, b) => a - b)
}

export function generateAlgorithmicDraw(scoreFrequencies: Record<number, number>): number[] {
  const entries = Object.entries(scoreFrequencies).map(([k, v]) => ({
    score: Number(k),
    weight: v,
  }))

  const total = entries.reduce((s, e) => s + e.weight, 0)
  const selected = new Set<number>()
  let attempts = 0

  while (selected.size < 5 && attempts < 2000) {
    attempts++
    const rand = Math.random() * total
    let cumulative = 0
    for (const entry of entries) {
      cumulative += entry.weight
      if (rand <= cumulative && !selected.has(entry.score)) {
        selected.add(entry.score)
        break
      }
    }
    // fallback
    if (selected.size < 5 && attempts > 1000) {
      const n = Math.floor(Math.random() * 45) + 1
      selected.add(n)
    }
  }

  return [...selected].sort((a, b) => a - b)
}

export function countMatches(userScores: number[], drawnNumbers: number[]): number {
  return userScores.filter(s => drawnNumbers.includes(s)).length
}

export function calculatePrizeTiers(totalPool: number, jackpotRollover = 0) {
  return {
    match5: totalPool * 0.40 + jackpotRollover,
    match4: totalPool * 0.35,
    match3: totalPool * 0.25,
  }
}
