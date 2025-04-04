/**
 * NOVAMIND Neural-Safe Utilities
 * Domain utilities exports test with quantum-level precision
 */

import { describe, it, expect } from "vitest";
import * as utils from "@domain/utils/index";

describe("Domain utilities exports", () => {
  it("exports shared type verification utilities", () => {
    expect(utils.typeVerifier).toBeDefined();
    expect(utils.TypeVerificationError).toBeDefined();
  });

  it("exports brain-specific type verification utilities", () => {
    expect(utils.brainTypeVerifier).toBeDefined();
    expect(utils.BrainTypeVerifier).toBeDefined();
  });

  it("exports clinical-specific type verification utilities", () => {
    expect(utils.clinicalTypeVerifier).toBeDefined();
    expect(utils.ClinicalTypeVerifier).toBeDefined();
  });

  it("exports unified verifiers object", () => {
    expect(utils.verifiers).toBeDefined();
    expect(utils.verifiers.common).toBe(utils.typeVerifier);
    expect(utils.verifiers.brain).toBe(utils.brainTypeVerifier);
    expect(utils.verifiers.clinical).toBe(utils.clinicalTypeVerifier);
  });

  it("ensures verifiers have the correct methods", () => {
    // Common verifier methods
    expect(typeof utils.typeVerifier.verifyString).toBe("function");
    expect(typeof utils.typeVerifier.verifyNumber).toBe("function");
    expect(typeof utils.typeVerifier.verifyBoolean).toBe("function");
    expect(typeof utils.typeVerifier.verifyArray).toBe("function");
    expect(typeof utils.typeVerifier.verifyObject).toBe("function");

    // Brain verifier methods
    expect(typeof utils.brainTypeVerifier.verifyBrainModel).toBe("function");
    expect(typeof utils.brainTypeVerifier.verifyBrainRegion).toBe("function");
    expect(typeof utils.brainTypeVerifier.verifyNeuralConnection).toBe(
      "function",
    );
    expect(typeof utils.brainTypeVerifier.verifyVector3).toBe("function");
    expect(typeof utils.brainTypeVerifier.verifyRenderMode).toBe("function");

    // Clinical verifier methods
    expect(typeof utils.clinicalTypeVerifier.verifyPatient).toBe("function");
    expect(typeof utils.clinicalTypeVerifier.verifySymptom).toBe("function");
    expect(typeof utils.clinicalTypeVerifier.verifyDiagnosis).toBe("function");
    expect(typeof utils.clinicalTypeVerifier.verifyTreatment).toBe("function");
    expect(typeof utils.clinicalTypeVerifier.verifyRiskLevel).toBe("function");
  });
});
