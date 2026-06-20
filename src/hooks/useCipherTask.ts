import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { CipherTask } from '@/types';
import { analyzeFrequency, findPatterns, applySubstitution, validateTranslation } from '@/utils/cipher';
import type { FrequencyResult, PatternResult, ValidationResult } from '@/types';

export function useCipherTask() {
  const { tasks, currentTaskId, setCurrentTask, getCurrentTask } = useAppStore();
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const currentTask: CipherTask | null = getCurrentTask();

  const frequency: FrequencyResult[] = currentTask
    ? analyzeFrequency(currentTask.ciphertext)
    : [];

  const patterns: PatternResult[] = currentTask
    ? findPatterns(currentTask.ciphertext, 2, 4)
    : [];

  const translation: string = currentTask
    ? applySubstitution(currentTask.ciphertext, currentTask.substitutionMap)
    : '';

  useEffect(() => {
    setValidation(null);
  }, [currentTaskId, currentTask?.substitutionMap]);

  const submitTranslation = (): ValidationResult | null => {
    if (!currentTask) return null;
    const result = validateTranslation(translation, currentTask.plaintextAnswer);
    setValidation(result);

    if (result.isCorrect) {
      useAppStore.getState().completeTask(currentTask.id);
    }

    return result;
  };

  const mappedCount = currentTask ? Object.keys(currentTask.substitutionMap).length : 0;
  const uniqueCharsCount = currentTask
    ? new Set(currentTask.ciphertext.replace(/[^A-Z]/g, '')).size
    : 0;

  return {
    tasks,
    currentTask,
    currentTaskId,
    setCurrentTask,
    frequency,
    patterns,
    translation,
    validation,
    submitTranslation,
    mappedCount,
    uniqueCharsCount,
  };
}
