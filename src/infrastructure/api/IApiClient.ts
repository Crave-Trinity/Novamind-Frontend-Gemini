/**
 * IApiClient - The common interface for all API clients
 *
 * This interface acts as the "port" in ports & adapters architecture.
 * All API clients must implement this interface, allowing them to be
 * interchangeable with zero changes to business logic.
 */
export interface IApiClient {
  // Authentication
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  isAuthenticated(): boolean;
  login(email: string, password: string): Promise<any>;

  // HTTP methods
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;

  // Domain-specific methods
  getPatients(): Promise<any[]>;
  getPatientById(patientId: string): Promise<any>;
  getBrainModel(modelId?: string): Promise<any>;
  predictTreatmentResponse(patientId: string, treatmentData: any): Promise<any>;
  getRiskAssessment(patientId: string): Promise<any>;
}
