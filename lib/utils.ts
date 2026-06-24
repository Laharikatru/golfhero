import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTHS } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getMonthName(month: number): string {
  return MONTHS[month - 1]
}

export function getDrawNumbers(draw: { number_1?: number; number_2?: number; number_3?: number; number_4?: number; number_5?: number }): number[] {
  return [draw.number_1, draw.number_2, draw.number_3, draw.number_4, draw.number_5].filter((n): n is number => n !== undefined && n !== null)
}

export function countMatches(userScores: number[], drawNumbers: number[]): { count: number; matched: number[] } {
  const matched = userScores.filter(s => drawNumbers.includes(s))
  return { count: matched.length, matched }
}

export function generateRandomNumbers(count = 5, min = 1, max = 45): number[] {
  const nums = new Set<number>()
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return Array.from(nums).sort((a, b) => a - b)
}

export function generateAlgorithmicNumbers(scoreFrequencies: Map<number, number>, count = 5): number[] {
  // Weight numbers by frequency — higher frequency = higher chance
  const entries = Array.from(scoreFrequencies.entries())
  const totalWeight = entries.reduce((sum, [, freq]) => sum + freq, 0)
  
  const selected = new Set<number>()
  let attempts = 0
  
  while (selected.size < count && attempts < 1000) {
    attempts++
    const rand = Math.random() * totalWeight
    let cumulative = 0
    
    for (const [score, freq] of entries) {
      cumulative += freq
      if (rand <= cumulative && !selected.has(score)) {
        selected.add(score)
        break
      }
    }
    
    // Fallback: pick any unused number
    if (selected.size < count && attempts > 500) {
      const available = Array.from({ length: 45 }, (_, i) => i + 1).filter(n => !selected.has(n))
      if (available.length > 0) {
        selected.add(available[Math.floor(Math.random() * available.length)])
      }
    }
  }
  
  return Array.from(selected).sort((a, b) => a - b)
}

export function getPrizeShareText(matchCount: number): string {
  switch (matchCount) {
    case 5: return '5-Number Match — Jackpot!'
    case 4: return '4-Number Match'
    case 3: return '3-Number Match'
    default: return 'No match'
  }
}

export function getSubscriptionStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-emerald-400'
    case 'trialing': return 'text-blue-400'
    case 'past_due': return 'text-amber-400'
    case 'cancelled': return 'text-red-400'
    default: return 'text-zinc-400'
  }
}

export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'paid': return 'text-emerald-400'
    case 'approved': return 'text-blue-400'
    case 'pending': return 'text-amber-400'
    case 'rejected': return 'text-red-400'
    default: return 'text-zinc-400'
  }
}

export function calcCharityContribution(subscriptionAmount: number, pct: number): number {
  return Number(((subscriptionAmount * pct) / 100).toFixed(2))
}

export function calcPrizePool(activeSubscribers: number, monthlyAmount: number, poolPct: number): number {
  return Number(((activeSubscribers * monthlyAmount * poolPct) / 100).toFixed(2))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim()
}
