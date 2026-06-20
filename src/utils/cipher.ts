import type { FrequencyResult, PatternResult, ValidationResult } from '@/types';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function analyzeFrequency(text: string): FrequencyResult[] {
  const counts: Record<string, number> = {};
  let totalLetters = 0;

  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      counts[ch] = (counts[ch] || 0) + 1;
      totalLetters++;
    }
  }

  const results: FrequencyResult[] = Object.entries(counts).map(([char, count]) => ({
    char,
    count,
    percentage: totalLetters > 0 ? (count / totalLetters) * 100 : 0,
  }));

  return results.sort((a, b) => b.count - a.count);
}

export function findPatterns(text: string, minLength = 2, maxLength = 5): PatternResult[] {
  const patterns: Record<string, { count: number; positions: number[] }> = {};

  for (let len = minLength; len <= maxLength; len++) {
    for (let i = 0; i <= text.length - len; i++) {
      const slice = text.slice(i, i + len);
      if (!/^[A-Z]+$/.test(slice)) continue;

      if (!patterns[slice]) {
        patterns[slice] = { count: 0, positions: [] };
      }
      patterns[slice].count++;
      patterns[slice].positions.push(i);
    }
  }

  const results: PatternResult[] = Object.entries(patterns)
    .filter(([, data]) => data.count >= 2)
    .map(([pattern, data]) => ({
      pattern,
      count: data.count,
      positions: data.positions,
    }))
    .sort((a, b) => b.count - a.count || b.pattern.length - a.pattern.length);

  return results.slice(0, 20);
}

export function applySubstitution(text: string, map: Record<string, string>): string {
  let result = '';
  for (const ch of text) {
    if (/[A-Z]/.test(ch) && map[ch]) {
      result += map[ch];
    } else if (ch === ' ' || ch === '\n' || ch === '\t') {
      result += ch;
    } else if (/[^A-Za-z]/.test(ch)) {
      result += ch;
    } else if (/[A-Z]/.test(ch)) {
      result += '·';
    } else {
      result += ch;
    }
  }
  return result;
}

export function validateTranslation(
  translation: string,
  answer: string
): ValidationResult {
  const errorIndices: number[] = [];
  let correctCount = 0;
  let totalCount = 0;

  const maxLen = Math.max(translation.length, answer.length);

  for (let i = 0; i < maxLen; i++) {
    const tChar = translation[i] || '';
    const aChar = answer[i] || '';

    if (/[A-Za-z]/.test(aChar)) {
      totalCount++;
      if (tChar.toUpperCase() === aChar.toUpperCase()) {
        correctCount++;
      } else {
        errorIndices.push(i);
      }
    }
  }

  return {
    isCorrect: totalCount > 0 && correctCount === totalCount,
    errorIndices,
    correctCount,
    totalCount,
    accuracy: totalCount > 0 ? (correctCount / totalCount) * 100 : 0,
  };
}

export function createSubstitutionCipher(plaintext: string): {
  ciphertext: string;
  map: Record<string, string>;
} {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffled = [...alphabet].sort(() => Math.random() - 0.5);

  const map: Record<string, string> = {};
  const reverseMap: Record<string, string> = {};

  for (let i = 0; i < alphabet.length; i++) {
    map[alphabet[i]] = shuffled[i];
    reverseMap[shuffled[i]] = alphabet[i];
  }

  let ciphertext = '';
  for (const ch of plaintext) {
    if (/[A-Z]/.test(ch)) {
      ciphertext += map[ch];
    } else {
      ciphertext += ch;
    }
  }

  return { ciphertext, map: reverseMap };
}

export function getUniqueChars(text: string): string[] {
  const set = new Set<string>();
  for (const ch of text) {
    if (/[A-Z]/.test(ch)) {
      set.add(ch);
    }
  }
  return Array.from(set).sort();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
}
