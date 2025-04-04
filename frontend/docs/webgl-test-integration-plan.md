# WebGL/Three.js Testing Integration Plan

## Integration with Overall Testing Architecture

The WebGL/Three.js mocking system we've implemented serves as a foundational layer in the overall testing architecture of the Novamind platform. Here's how it fits into the broader testing strategy:

### Testing Hierarchy

1. **Foundation Layer** (Current Implementation)
   - WebGL context mocks (`mock-webgl.ts`)
   - Three.js object mocks (`three-mocks.ts`) 
   - Integration API (`index.ts`)

2. **Component Testing Layer**
   - Individual visualization components (e.g., `BrainRegionVisualizer`)
   - UI component tests that render Three.js content
   - Isolated feature tests (selection, highlighting, etc.)

3. **Integration Testing Layer**
   - Combined visualization components
   - Complex user interactions
   - Cross-component state management

4. **Application Testing Layer**
   - End-to-end visualization workflows
   - Performance testing for complex visualizations
   - Memory leak detection in long-running scenarios

## Resolving Hanging Tests

### Verification Strategy

To verify our solution has resolved the hanging test issues, we should follow these steps:

1. **Identify Previously Problematic Tests**
   - Review tests mentioned in `frontend/docs/test-hang-investigation.md`
   - Check existing fix scripts like `fix-brain-visualization-tests.sh` and `fix-neural-visualizers.sh`
   - Compile a list of specific test files that were consistently hanging

2. **Apply Mock System Systematically**
   - Start with the most problematic tests first
   - Refactor tests to use our mocking system
   - Ensure proper cleanup in afterEach/afterAll hooks

3. **Run Tests with Timing Verification**
   ```bash
   # Run previously hanging tests with timing information
   TIME_TESTS=true npx vitest run path/to/hanging/test.ts
   
   # Run with previously created timeout safeguards
   npm run run-with-timeout path/to/hanging/test.ts
   ```

4. **Update Test Runner Scripts**
   - Modify `frontend/scripts/run-with-global-timeout.sh` to include mock setup
   - Update `frontend/scripts/fix-remaining-hanging-tests.ts` to use our mocks
   - Create a new script specifically for running Three.js tests

### Test Runner Integration Script

Create a new script (`frontend/scripts/run-3d-visualization-tests.ts`) that:

1. Automatically sets up the WebGL mocks
2. Runs tests with appropriate timeouts
3. Reports detailed timing information
4. Detects and reports any remaining hanging tests

## Immediate Next Steps

To verify our solution resolves the hanging tests:

1. **Identify test files with known hanging issues**:
   ```bash
   grep -r "hanging" frontend/docs/
   cat frontend/docs/test-hang-investigation.md
   ```

2. **Apply our mocks to a subset of problematic tests**:
   ```bash
   # Create a list of previously hanging test files
   npx ts-node frontend/scripts/identify-hanging-tests.ts > hanging-tests.txt
   
   # Apply mock system to these tests
   npx ts-node frontend/scripts/apply-webgl-mocks.ts --files=hanging-tests.txt
   ```

3. **Run tests with timing verification**:
   ```bash
   # Run with timeout mechanism
   VERBOSE=true npm run run-with-timeout src/presentation/visualizations/tests/
   ```

4. **Compare execution times before and after**:
   Create a report showing test execution time differences to quantify improvements.

## Long-term Integration

For sustainable testing of Three.js components:

1. **Add to CI/CD pipeline**: Ensure mocks are properly configured in CI environments
2. **Documentation**: Update component documentation to include testing requirements
3. **Training**: Ensure team members understand how to test new visualization components
4. **Monitoring**: Track test execution times to catch any regression in performance
