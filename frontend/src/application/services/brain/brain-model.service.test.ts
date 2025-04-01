/**
 * NOVAMIND Neural Test Suite
 * Brain Model Service testing with quantum precision
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { brainModelService } from "./brain-model.service";
import { BrainModel, BrainRegion, NeuralConnection } from "@domain/types/brain/models";

// Mock axios for isolated testing
vi.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Brain Model Service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("fetchBrainModel", () => {
    it("successfully fetches a brain model by ID", async () => {
      // Arrange
      const mockBrainModel: Partial<BrainModel> = {
        id: "scan123",
        name: "Test Brain Model",
        regions: [],
        connections: [],
        version: 1
      };
      
      mockedAxios.get.mockResolvedValueOnce({
        data: mockBrainModel,
        status: 200
      });

      // Act
      const result = await brainModelService.fetchBrainModel("scan123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockBrainModel);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/scan123"),
        expect.objectContaining({
          timeout: 15000
        })
      );
    });

    it("handles API error responses appropriately", async () => {
      // Arrange - Mock a 404 error
      const mockError = {
        response: {
          status: 404,
          data: { message: "Brain scan not found" }
        },
        isAxiosError: true
      };
      
      mockedAxios.get.mockRejectedValueOnce(mockError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act
      const result = await brainModelService.fetchBrainModel("nonexistent");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("not found");
    });

    it("handles network errors gracefully", async () => {
      // Arrange - Mock a network error
      const mockError = {
        request: {},
        isAxiosError: true
      };
      
      mockedAxios.get.mockRejectedValueOnce(mockError);
      mockedAxios.isAxiosError.mockReturnValueOnce(true);

      // Act
      const result = await brainModelService.fetchBrainModel("scan123");

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain("No response received");
    });
  });

  describe("searchBrainModels", () => {
    it("performs search with correct parameters", async () => {
      // Arrange
      const mockResponse = {
        data: {
          data: [{ id: "scan123", name: "Test Model", regions: [], connections: [], version: 1 }],
          total: 1
        },
        status: 200
      };
      
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await brainModelService.searchBrainModels(
        "patient456", 
        { from: "2025-01-01", to: "2025-04-01" },
        "fMRI",
        10,
        0
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value.models).toHaveLength(1);
      expect(result.value.total).toBe(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          params: expect.objectContaining({
            patientId: "patient456",
            from: "2025-01-01",
            to: "2025-04-01",
            scanType: "fMRI",
            limit: 10,
            offset: 0
          })
        })
      );
    });
  });

  describe("updateRegion", () => {
    it("successfully updates a brain region", async () => {
      // Arrange
      const mockRegion: Partial<BrainRegion> = {
        id: "region123",
        name: "Updated Region",
        activityLevel: 0.8,
        isActive: true
      };
      
      mockedAxios.patch.mockResolvedValueOnce({
        data: mockRegion,
        status: 200
      });

      // Act
      const result = await brainModelService.updateRegion(
        "scan123", 
        "region123", 
        { activityLevel: 0.8, isActive: true }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockRegion);
    });
  });

  describe("updateConnection", () => {
    it("successfully updates a neural connection", async () => {
      // Arrange
      const mockConnection: Partial<NeuralConnection> = {
        id: "conn123",
        strength: 0.6,
        isActive: true
      };
      
      mockedAxios.patch.mockResolvedValueOnce({
        data: mockConnection,
        status: 200
      });

      // Act
      const result = await brainModelService.updateConnection(
        "scan123", 
        "conn123", 
        { strength: 0.6, isActive: true }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value).toEqual(mockConnection);
    });
  });

  describe("createAnnotation", () => {
    it("successfully creates an annotation", async () => {
      // Arrange
      const mockResponse = {
        id: "anno123",
        createdAt: "2025-04-01T00:00:00Z"
      };
      
      const mockAnnotation = {
        regionIds: ["r1", "r2"],
        text: "Important finding",
        author: "Dr. Smith",
        category: "clinical" as const,
        visibility: "team" as const
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 201
      });

      // Act
      const result = await brainModelService.createAnnotation(
        "scan123", 
        mockAnnotation
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.value.id).toBe("anno123");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/annotations"),
        mockAnnotation,
        expect.anything()
      );
    });
  });

  describe("generateModel", () => {
    it("successfully initiates model generation", async () => {
      // Arrange
      const mockResponse = {
        scanId: "scan-gen-123",
        status: "processing"
      };
      
      mockedAxios.post.mockResolvedValueOnce({
        data: mockResponse,
        status: 202
      });

      // Act
      const result = await brainModelService.generateModel("patient456");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value.status).toBe("processing");
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/generate"),
        { patientId: "patient456" },
        expect.anything()
      );
    });
  });

  describe("checkGenerationStatus", () => {
    it("retrieves the current generation status", async () => {
      // Arrange
      const mockResponse = {
        status: "processing",
        progress: 0.65,
        scanId: undefined,
        error: undefined
      };
      
      mockedAxios.get.mockResolvedValueOnce({
        data: mockResponse,
        status: 200
      });

      // Act
      const result = await brainModelService.checkGenerationStatus("gen123");

      // Assert
      expect(result.success).toBe(true);
      expect(result.value.status).toBe("processing");
      expect(result.value.progress).toBe(0.65);
    });
  });
});
