
# LeafCode Runner

## What It Does
Executes user code and measures energy consumption using Cloud Energy's XGBoost ML model.

## Runner Interface
The runner interfaces with external programs via STDIN/STDOUT. It receives code submissions in the form of JSON through STDIN, executes the code, and returns energy measurements in JSON format through STDOUT. No other input is accepted through STDIN, and no other output is produced on STDOUT except for the JSON response.

The input format is as follows:

```json
{
  "submissionId": "unique-id",
  "code": "print(42)",
  "language": "python"
}
```

**Response:**
```json
{
  "status": "accepted",
  "energyJoules": 8.49,
  "executionTimeMs": 65,
  "avgPowerWatts": 16.97,
  "numReadings": 1
}
```

## Testing Manually

While this runner is designed to be deployed in a sandbox environment and be used programatically through the LeafCode API, it can be tested manually by simulating the input and output through the command line.

Firsts, install the required dependencies:

```bash
pip install -r requirements.txt
```

Then run the script and provide input through the terminal. You can use `echo` to simulate the input, or provide it manually and terminate with EOF (Ctrl+D on Unix, Ctrl+Z on Windows):

```bash
echo '{"submissionId": "test-id", "code": "print(42)", "language": "python"}' | python executor.py
```

On completion, the JSON response with measurements will be printed to the terminal.

## Third-Party Licenses
This project includes code and data from the cloud-energy project:
https://github.com/green-coding-solutions/cloud-energy

Original license: MIT License
Copyright (c) Green Coding Solutions

Files used from the cloud-energy project include:
- auto_detect.py
- xgb.py
- data/spec_data_cleaned.csv