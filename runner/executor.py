"""
Cloud Energy Executor
Loads XGBoost model, executes code, measures energy
"""

import json
import argparse
import subprocess
import tempfile
import os
import sys
import time
import threading

sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
import psutil

try:
    from xgboost import XGBRegressor  # type: ignore[import-not-found]
except ImportError:  # optional in functional mode
    XGBRegressor = None

# Global cache
MODEL = None
PREDICTIONS = None


def _load_code_from_file(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    if not os.path.isfile(file_path):
        raise ValueError(f"Not a file: {file_path}")
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()


def _build_input_payload():
    parser = argparse.ArgumentParser(description='Execute code with energy monitoring')
    parser.add_argument('--mode', choices=['energy', 'functional'], default='energy')
    parser.add_argument('-l', '--language', help='Execution language (e.g. python, javascript)')
    parser.add_argument('-s', '--submission-id', help='Submission ID')
    parser.add_argument('-f', '--file', help='Path to source code file')

    args = parser.parse_args()

    # JSON mode: no CLI args, full request from stdin
    if len(sys.argv) == 1:
        stdin_text = sys.stdin.read()
        if not stdin_text.strip():
            raise ValueError('No input provided. Pass JSON via stdin or use CLI arguments.')
        try:
            payload = json.loads(stdin_text)
        except json.JSONDecodeError as exc:
            raise ValueError('Expected JSON input on stdin when no CLI arguments are provided.') from exc

        if not isinstance(payload, dict):
            raise ValueError('JSON input must be an object.')

        if 'language' not in payload or 'submissionId' not in payload:
            raise ValueError('Missing required fields: language and submissionId')

        has_code = 'code' in payload and bool(str(payload['code']).strip())
        has_file = 'file' in payload and bool(str(payload['file']).strip())

        if not has_code and not has_file:
            raise ValueError('Missing required field: code (or provide file)')

        if has_file:
            # Validate the path early and execute file directly later.
            _load_code_from_file(payload['file'])

        return {
            'language': payload['language'],
            'submissionId': payload['submissionId'],
            'code': payload['code'] if has_code else None,
            'sourceFile': payload['file'] if has_file else None,
            'stdinData': str(payload.get('stdin', '')),
            'mode': args.mode,
        }

    # CLI mode: language + submission ID required, code from stdin or --file
    if not args.language or not args.submission_id:
        raise ValueError('CLI mode requires --language and --submission-id')

    if args.file:
        _load_code_from_file(args.file)
        source_file = args.file
        code = None
    else:
        if sys.stdin.isatty():
            raise ValueError('Provide code via stdin or use --file <path>')
        stdin_text = sys.stdin.read()
        if not stdin_text.strip():
            raise ValueError('Provide code via stdin or use --file <path>')
        code = stdin_text
        source_file = None

    return {
        'language': args.language,
        'submissionId': args.submission_id,
        'code': code,
        'sourceFile': source_file,
        'stdinFile': args.stdin_file,
        'stdinData': None,
        'mode': args.mode,
    }

def load_model():
    """Load model on first use"""
    global MODEL, PREDICTIONS

    if XGBRegressor is None:
        raise RuntimeError('xgboost is required for energy mode but is not installed.')
    
    if MODEL is not None:
        return MODEL, PREDICTIONS
    
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'spec_data_cleaned.csv')
    df = pd.read_csv(data_path)
    
    hardware = {
        'HW_CPUFreq': 3000,
        'CPUThreads': 2,
        'CPUCores': 2,
        'TDP': 15,
        'HW_MemAmountGB': 3
    }
    
    X = df.copy()
    X = pd.get_dummies(X, columns=['CPUMake', 'Architecture'])
    X = X[X.CPUChips == 1]
    y = X.power
    
    Z = pd.DataFrame.from_dict({
        'HW_CPUFreq': [hardware['HW_CPUFreq']],
        'CPUThreads': [hardware['CPUThreads']],
        'CPUCores': [hardware['CPUCores']],
        'TDP': [hardware['TDP']],
        'HW_MemAmountGB': [hardware['HW_MemAmountGB']],
        'utilization': [0.0]
    })
    Z = Z.dropna(axis=1)
    X = X[Z.columns]
    
    model = XGBRegressor()
    model.fit(X, y)
    
    predictions = {}
    for util in range(0, 101):
        Z_pred = Z.copy()
        Z_pred['utilization'] = util
        predictions[float(util)] = float(model.predict(Z_pred)[0])
    
    MODEL = model
    PREDICTIONS = predictions
    
    return model, predictions

def estimate_power(cpu_percent):
    if PREDICTIONS is None:
        load_model()
    assert PREDICTIONS is not None, "Model not loaded"
    cpu_int = max(0, min(100, int(round(cpu_percent))))
    return PREDICTIONS[float(cpu_int)]

def monitor_energy(stop_event, energy_readings):
    while not stop_event.is_set():
        start = time.time()
        cpu = psutil.cpu_percent(interval=0.1)
        power = estimate_power(cpu)
        elapsed = time.time() - start
        energy = power * elapsed
        energy_readings.append(energy)
        time.sleep(max(0, 0.5 - elapsed))

def execute_with_monitoring(code, language, source_file=None):
    load_model()

    cleanup_temp_file = False
    if source_file:
        code_file = source_file
    else:
        suffix = '.py' if language == 'python' else '.js'
        with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False) as f:
            f.write(code)
            code_file = f.name
        cleanup_temp_file = True
    
    try:
        energy_readings = []
        stop_event = threading.Event()
        
        monitor_thread = threading.Thread(target=monitor_energy, args=(stop_event, energy_readings))
        monitor_thread.start()
        time.sleep(0.2)
        
        start_time = time.time()
        cmd = ['python3', code_file] if language == 'python' else ['node', code_file]
        result = subprocess.run(
            cmd,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=60,
        )
        execution_time = int((time.time() - start_time) * 1000)
        
        stop_event.set()
        monitor_thread.join(timeout=1)
        
        total_energy = sum(energy_readings)
        avg_power = total_energy / (len(energy_readings) * 0.5) if energy_readings else 0
        
        return {
            'status': 'accepted' if result.returncode == 0 else 'error',
            'energyJoules': round(total_energy, 2),
            'executionTimeMs': execution_time,
            'avgPowerWatts': round(avg_power, 2),
            'numReadings': len(energy_readings)
        }
        
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'error': 'Timeout (10s limit)'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}
    finally:
        if cleanup_temp_file and os.path.exists(code_file):
            os.unlink(code_file)

def execute_functionally(code, language, source_file=None, stdin_data=''):
    cleanup_temp_file = False
    if source_file:
        code_file = source_file
    else:
        suffix = '.py' if language == 'python' else '.js'
        with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False) as f:
            f.write(code)
            code_file = f.name
        cleanup_temp_file = True

    try:
        start_time = time.time()
        cmd = ['python3', code_file] if language == 'python' else ['node', code_file]
        result = subprocess.run(
            cmd,
            input=stdin_data,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=60,
        )
        execution_time = int((time.time() - start_time) * 1000)

        return {
            'status': 'accepted' if result.returncode == 0 else 'error',
            'stdout': result.stdout,
            'stderr': result.stderr,
            'exitCode': result.returncode,
            'executionTimeMs': execution_time,
        }
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'error': 'Timeout (60s limit)'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}
    finally:
        if cleanup_temp_file and os.path.exists(code_file):
            os.unlink(code_file)

if __name__ == '__main__':
    try:
        input_data = _build_input_payload()
    except Exception as e:
        print(json.dumps({'status': 'error', 'error': str(e)}))
        sys.exit(1)

    stdin_data = input_data.get('stdinData') or ''
    stdin_file = input_data.get('stdinFile')
    if stdin_file:
        stdin_data = _load_code_from_file(stdin_file)

    if input_data.get('mode') == 'functional':
        result = execute_functionally(
            input_data['code'],
            input_data['language'],
            input_data.get('sourceFile'),
            stdin_data,
        )
    else:
        result = execute_with_monitoring(
            input_data['code'],
            input_data['language'],
            input_data.get('sourceFile'),
            stdin_data,
        )
    result['submissionId'] = input_data['submissionId']
    print(json.dumps(result))
