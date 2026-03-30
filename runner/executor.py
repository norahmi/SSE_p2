"""
Cloud Energy Executor
Loads XGBoost model, executes code, measures energy
"""

import json
import subprocess
import tempfile
import os
import sys
import time
import threading

sys.path.insert(0, os.path.dirname(__file__))

import pandas as pd
from xgboost import XGBRegressor
import psutil

# Global cache
MODEL = None
PREDICTIONS = None

def load_model():
    """Load model on first use"""
    global MODEL, PREDICTIONS
    
    if MODEL is not None:
        return MODEL, PREDICTIONS
    
    print("[Model] Loading...", file=sys.stderr, flush=True)
    
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
    
    print("[Model] Ready", file=sys.stderr, flush=True)
    return model, predictions

def estimate_power(cpu_percent):
    if PREDICTIONS is None:
        load_model()
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

def execute_with_monitoring(code, language):
    load_model()
    
    suffix = '.py' if language == 'python' else '.js'
    with tempfile.NamedTemporaryFile(mode='w', suffix=suffix, delete=False) as f:
        f.write(code)
        code_file = f.name
    
    try:
        energy_readings = []
        stop_event = threading.Event()
        
        monitor_thread = threading.Thread(target=monitor_energy, args=(stop_event, energy_readings))
        monitor_thread.start()
        time.sleep(0.2)
        
        start_time = time.time()
        cmd = ['python3', code_file] if language == 'python' else ['node', code_file]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
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
            'numReadings': len(energy_readings),
            'output': result.stdout,
            'stderr': result.stderr if result.returncode != 0 else None
        }
        
    except subprocess.TimeoutExpired:
        return {'status': 'timeout', 'error': 'Timeout (10s limit)'}
    except Exception as e:
        return {'status': 'error', 'error': str(e)}
    finally:
        if os.path.exists(code_file):
            os.unlink(code_file)

if __name__ == '__main__':
    input_data = json.loads(sys.stdin.read())
    result = execute_with_monitoring(input_data['code'], input_data['language'])
    print(json.dumps(result))
