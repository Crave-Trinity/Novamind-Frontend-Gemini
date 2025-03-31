/**
 * NOVAMIND Neural Architecture
 * Neural-Safe Jest-DOM Configuration with Quantum Precision
 * 
 * This file properly configures the jest-dom extensions for 
 * comprehensive neural-safe testing with clinical precision.
 */

import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers as any);
