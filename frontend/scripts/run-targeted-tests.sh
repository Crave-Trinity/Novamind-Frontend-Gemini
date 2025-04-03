#!/bin/bash
# Script to run targeted tests in small batches to verify fixes
# This prevents test hanging by only running compatible tests together

# Change to the frontend directory
cd "$(dirname "$0")/.." || exit 1
echo "Running in directory: $(pwd)"

echo "Running targeted test batches..."

# Function to run a test and report success/failure
run_test() {
  test_file=$1
  echo ""
  echo "====== Testing: $test_file ======"
  
  # Run test with proper vitest syntax (no --timeout flag)
  npm run test -- "$test_file"
  
  if [ $? -eq 0 ]; then
    echo "✅ Test Passed: $test_file"
    return 0
  else
    echo "❌ Test Failed: $test_file"
    return 1
  fi
}

# Batch 1: Core validation tests
echo "========== Batch 1: Core Validation Tests =========="
run_test "src/application/services/brain/brain-model.service.runtime.test.ts"
validation_result=$?

# Batch 2: Minimal visualization tests
echo "========== Batch 2: Minimal Visualization Tests =========="
run_test "src/presentation/molecules/NeuralActivityVisualizer.test.tsx"
vis_result=$?

# Batch 3: UI Component tests
echo "========== Batch 3: UI Component Tests =========="
run_test "src/presentation/atoms/Button.test.tsx"
ui_result=$?

# Batch 4: TypeScript validation tests
echo "========== Batch 4: TypeScript Validation Tests =========="
run_test "src/interfaces/BrainVisualizationProps.test.ts"
ts_result=$?

# Display summary
echo ""
echo "====== Test Summary ======"
echo "Core Validation: $([ $validation_result -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "Visualization: $([ $vis_result -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "UI Components: $([ $ui_result -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"
echo "TypeScript: $([ $ts_result -eq 0 ] && echo '✅ PASS' || echo '❌ FAIL')"

# Calculate overall result
overall=$((validation_result + vis_result + ui_result + ts_result))
if [ $overall -eq 0 ]; then
  echo "✅ All test batches passed!"
  exit 0
else
  echo "❌ Some test batches failed!"
  exit 1
fi