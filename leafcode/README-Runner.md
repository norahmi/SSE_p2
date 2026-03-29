
# LeafCode Execution API - Quick Guide

## What It Does
Executes user code and measures energy consumption using Cloud Energy's XGBoost ML model.

---

## API Endpoint

**POST** `/api/execute`

**Request:**
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
  "submissionId": "unique-id",
  "status": "accepted",
  "energyJoules": 8.75,
  "executionTimeMs": 38,
  "output": "42\n",
  "method": "cloud_energy_xgboost"
}
```

---

## Testing Locally

### 1. Install Dependencies
```bash
pip3 install -r requirements.txt
npm run dev
```

### 2. Test with curl
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "submissionId": "test-001",
    "code": "print(42)",
    "language": "python"
  }'
```

**Expected Output:**
```json
{
  "submissionId": "test-001",
  "status": "accepted",
  "energyJoules": 8.75,
  "executionTimeMs": 38,
  "output": "42\n"
}
```

---

## Integration with IDE

This API will be called when users submit code from the IDE:
```typescript
// Example integration
const response = await fetch('/api/execute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    submissionId: generateId(),
    code: editorContent,
    language: 'python'
  })
});

const result = await response.json();

// Save to database
await saveSubmission({
  userId: session.user.id,
  energyJoules: result.energyJoules,
  output: result.output,
  status: result.status
});

// Show results to user
displayResults(result);
```
---

## Important Notes

- **First request takes 4-6 seconds** (model loading)
- **Subsequent requests ~1-2 seconds** (model cached)
- **Energy varies ±10%** due to system CPU fluctuations (expected)
- **Supports:** Python and JavaScript

---

## Files
```
app/api/execute/route.ts       ← API endpoint
lib/cloud-energy/executor.py   ← Energy measurement
lib/cloud-energy/              ← Cloud Energy ML model files
requirements.txt               ← Python dependencies
```