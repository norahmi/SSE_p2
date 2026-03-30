import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawn, spawnSync } from 'node:child_process'
import { getRunnerLayout, type RunnerLanguage } from '@/lib/execution/templates'

const DEFAULT_COMPILE_TIMEOUT_MS = 10_000
const DEFAULT_RUN_TIMEOUT_MS = 3_000
const MAX_CODE_SIZE_BYTES = 100_000
const MAX_STDIO_BYTES = 256_000

export interface FunctionalTestCase {
  stdin: string
  expectedStdout: string
}

export interface FunctionalRunRequest {
  language: RunnerLanguage
  assignmentId: number
  studentCode: string
  testCases: FunctionalTestCase[]
  compileTimeoutMs?: number
  runTimeoutMs?: number
}

export type FunctionalFailureKind =
  | 'compile_error'
  | 'runtime_error'
  | 'wrong_answer'
  | 'timeout'
  | 'infrastructure_error'

export interface FunctionalRunResult {
  passed: boolean
  failureKind?: FunctionalFailureKind
  failedTestIndex?: number
  expectedStdout?: string
  actualStdout?: string
  stderr?: string
  compileStderr?: string
  message: string
  cleanStudentCode?: string
}

interface ProcessResult {
  exitCode: number | null
  stdout: string
  stderr: string
  timedOut: boolean
  outputLimitExceeded: boolean
}

function normalizeOutput(raw: string): string {
  return raw.replace(/\r\n/g, '\n').trimEnd()
}

function commandExists(command: string, args: string[]): boolean {
  const check = spawnSync(command, args, {
    windowsHide: true,
    shell: false,
    stdio: 'ignore',
    timeout: 2_000,
  })

  return !check.error
}

function resolveCommand(candidates: Array<{ command: string; args: string[] }>): string | null {
  for (const candidate of candidates) {
    if (commandExists(candidate.command, candidate.args)) {
      return candidate.command
    }
  }
  return null
}

async function execProcess(params: {
  command: string
  args: string[]
  cwd: string
  stdin: string
  timeoutMs: number
}): Promise<ProcessResult> {
  return new Promise((resolve) => {
    const child = spawn(params.command, params.args, {
      cwd: params.cwd,
      shell: false,
      windowsHide: true,
      env: { ...process.env },
      stdio: 'pipe',
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false
    let outputLimitExceeded = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill()
    }, params.timeoutMs)

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
      if (Buffer.byteLength(stdout, 'utf8') > MAX_STDIO_BYTES) {
        outputLimitExceeded = true
        child.kill()
      }
    })

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
      if (Buffer.byteLength(stderr, 'utf8') > MAX_STDIO_BYTES) {
        outputLimitExceeded = true
        child.kill()
      }
    })

    child.on('error', (error: Error) => {
      clearTimeout(timer)
      resolve({
        exitCode: -1,
        stdout,
        stderr: `${stderr}\n${error.message}`.trim(),
        timedOut,
        outputLimitExceeded,
      })
    })

    child.on('close', (exitCode: number | null) => {
      clearTimeout(timer)
      resolve({ exitCode, stdout, stderr, timedOut, outputLimitExceeded })
    })

    child.stdin.write(params.stdin)
    child.stdin.end()
  })
}

async function compileIfNeeded(params: {
  language: RunnerLanguage
  tempDir: string
  studentFileName: string
  driverFileName: string
  timeoutMs: number
}): Promise<{ ok: true; runCommand: string; runArgs: string[] } | { ok: false; compileStderr: string }> {
  if (params.language === 'PYTHON') {
    const pythonCommand = resolveCommand([
      { command: 'python3', args: ['--version'] },
      { command: 'python', args: ['--version'] },
      { command: 'py', args: ['-3', '--version'] },
    ])

    if (!pythonCommand) {
      return { ok: false, compileStderr: 'Python runtime not found on server.' }
    }

    const runArgs = pythonCommand === 'py'
      ? ['-3', params.driverFileName]
      : [params.driverFileName]

    return { ok: true, runCommand: pythonCommand, runArgs }
  }

  if (params.language === 'CPP') {
    const gppCommand = resolveCommand([
      { command: 'g++', args: ['--version'] },
      { command: 'clang++', args: ['--version'] },
    ])

    if (!gppCommand) {
      return { ok: false, compileStderr: 'C++ compiler not found on server (g++ or clang++).' }
    }

    const binaryName = process.platform === 'win32' ? 'runner.exe' : 'runner'
    const compile = await execProcess({
      command: gppCommand,
      args: [
        '-std=c++17',
        '-O3',
        '-pipe',
        '-include',
        'leafcode_runtime.hpp',
        params.driverFileName,
        params.studentFileName,
        '-o',
        binaryName,
      ],
      cwd: params.tempDir,
      stdin: '',
      timeoutMs: params.timeoutMs,
    })

    if (compile.timedOut) {
      return { ok: false, compileStderr: 'C++ compilation timed out.' }
    }

    if ((compile.exitCode ?? 1) !== 0) {
      return { ok: false, compileStderr: compile.stderr || 'C++ compilation failed.' }
    }

    return { ok: true, runCommand: join(params.tempDir, binaryName), runArgs: [] }
  }

  return { ok: false, compileStderr: `Unsupported runner language: ${params.language}` }
}

export async function runFunctionalTests(request: FunctionalRunRequest): Promise<FunctionalRunResult> {
  if (!Number.isInteger(request.assignmentId) || request.assignmentId <= 0) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: 'Invalid assignment id.',
    }
  }

  if (!request.studentCode || !request.studentCode.trim()) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: 'Student code is empty.',
    }
  }

  if (!Array.isArray(request.testCases) || request.testCases.length === 0) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: 'No functional tests were provided.',
    }
  }

  if (Buffer.byteLength(request.studentCode, 'utf8') > MAX_CODE_SIZE_BYTES) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: `Code is too large. Max size is ${MAX_CODE_SIZE_BYTES} bytes.`,
    }
  }

  const compileTimeoutMs = request.compileTimeoutMs ?? DEFAULT_COMPILE_TIMEOUT_MS
  const runTimeoutMs = request.runTimeoutMs ?? DEFAULT_RUN_TIMEOUT_MS

  const tempDir = await mkdtemp(join(tmpdir(), 'leafcode-runner-'))

  try {
    const layout = getRunnerLayout(request.language, request.assignmentId)
    await writeFile(join(tempDir, layout.studentFileName), request.studentCode, 'utf8')
    await writeFile(join(tempDir, layout.driverFileName), layout.driverSource, 'utf8')
    for (const supportFile of layout.supportFiles) {
      await writeFile(join(tempDir, supportFile.fileName), supportFile.content, 'utf8')
    }

    const compilation = await compileIfNeeded({
      language: request.language,
      tempDir,
      studentFileName: layout.studentFileName,
      driverFileName: layout.driverFileName,
      timeoutMs: compileTimeoutMs,
    })

    if (!compilation.ok) {
      return {
        passed: false,
        failureKind: 'compile_error',
        compileStderr: compilation.compileStderr,
        message: 'Compilation failed.',
      }
    }

    for (let i = 0; i < request.testCases.length; i++) {
      const test = request.testCases[i]
      const stdin = `${request.assignmentId}\n${test.stdin}`

      const run = await execProcess({
        command: compilation.runCommand,
        args: compilation.runArgs,
        cwd: tempDir,
        stdin,
        timeoutMs: runTimeoutMs,
      })

      if (run.outputLimitExceeded) {
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: 'Process exceeded output limit.',
          message: `Test #${i + 1} produced too much output.`,
        }
      }

      if (run.timedOut) {
        return {
          passed: false,
          failureKind: 'timeout',
          failedTestIndex: i,
          message: `Test #${i + 1} timed out after ${runTimeoutMs} ms.`,
        }
      }

      if ((run.exitCode ?? 1) !== 0) {
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: run.stderr,
          message: `Test #${i + 1} crashed with a runtime error.`,
        }
      }

      if (run.stderr.trim().length > 0) {
        return {
          passed: false,
          failureKind: 'runtime_error',
          failedTestIndex: i,
          stderr: run.stderr,
          message: `Test #${i + 1} wrote to stderr.`,
        }
      }

      const actual = normalizeOutput(run.stdout)
      const expected = normalizeOutput(test.expectedStdout)

      if (actual !== expected) {
        return {
          passed: false,
          failureKind: 'wrong_answer',
          failedTestIndex: i,
          expectedStdout: expected,
          actualStdout: actual,
          message: `Test #${i + 1} failed: wrong output.`,
        }
      }
    }

    return {
      passed: true,
      message: 'All functional tests passed.',
      cleanStudentCode: request.studentCode,
    }
  } catch (error) {
    return {
      passed: false,
      failureKind: 'infrastructure_error',
      message: `Runner infrastructure error: ${(error as Error).message}`,
    }
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}
