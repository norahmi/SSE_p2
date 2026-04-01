import { execSync } from 'node:child_process'
import { join } from 'node:path'
import type { RunnerLanguage } from './templates'

export interface EnergyResult {
  status: 'accepted' | 'error' | 'timeout'
  energyJoules: number
  executionTimeMs: number
  avgPowerWatts?: number
}

export async function measureEnergy(
  code: string,
  language: RunnerLanguage
): Promise<EnergyResult> {
  if (language !== 'PYTHON') {
    return { status: 'error', energyJoules: 0, executionTimeMs: 0 }
  }

  const submissionId = `local-${Date.now()}`

  const executorUrl = process.env.EXECUTOR_URL
  if (executorUrl) {
    try {
      const response = await fetch(executorUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.EXECUTOR_TOKEN
            ? { Authorization: `Bearer ${process.env.EXECUTOR_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({ code, language: 'python', submissionId }),
      })

      if (!response.ok) {
        console.error('[energy-executor] remote executor failed', response.status)
        return { status: 'error', energyJoules: 0, executionTimeMs: 0 }
      }

      const payload = (await response.json()) as Partial<EnergyResult>
      return {
        status: payload.status ?? 'error',
        energyJoules: Number(payload.energyJoules ?? 0),
        executionTimeMs: Number(payload.executionTimeMs ?? 0),
        avgPowerWatts: payload.avgPowerWatts,
      }
    } catch (error) {
      console.error('[energy-executor] remote executor error', error)
      return { status: 'error', energyJoules: 0, executionTimeMs: 0 }
    }
  }

  try {
    // Run from parent directory: c:\Delft\SSE_p2\runner\executor.py
    const executorPath = join(process.cwd(), '..', 'runner', 'executor.py')
    const result = execSync(`python "${executorPath}"`, {
      input: JSON.stringify({ code, language: 'python', submissionId }),
      encoding: 'utf-8',
      timeout: 15000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    return JSON.parse(result)
  } catch (error) {
    console.error('[energy-executor]', error)
    return { status: 'error', energyJoules: 0, executionTimeMs: 0 }
  }
}
