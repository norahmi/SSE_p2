import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, code, language } = body;

    if (!submissionId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['python', 'javascript'].includes(language)) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 }
      );
    }

    // Call Python executor
    const result = await executePython(code, language);

    return NextResponse.json({
      submissionId,
      ...result,
      method: 'cloud_energy_xgboost'
    });

  } catch (error: any) {
    console.error('Execution error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function executePython(code: string, language: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const projectRoot = process.cwd();
    const executorScript = join(projectRoot, 'lib', 'cloud-energy', 'executor.py');
    
    console.log('[API] Starting Python executor...');
    
    const pythonProc = spawn('python3', [executorScript], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProc.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log('[Python]', data.toString().trim());
    });
    
    pythonProc.on('close', (exitCode) => {
      if (exitCode !== 0) {
        console.error('[Python] Error:', stderr);
        reject(new Error('Python execution failed'));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        console.log(`[API] ✓ Energy: ${result.energyJoules}J`);
        resolve(result);
      } catch (parseError) {
        console.error('[API] Failed to parse:', stdout);
        reject(new Error('Failed to parse Python output'));
      }
    });
    
    pythonProc.on('error', (error) => {
      console.error('[Python] Spawn error:', error);
      reject(error);
    });
    
    // Send input to Python
    const input = JSON.stringify({ code, language });
    pythonProc.stdin.write(input);
    pythonProc.stdin.end();
  });
}