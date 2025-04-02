export function apiClient(data: any) {
  // For testing, simply return the provided data with a flag indicating processing.
  return { ...data, served: true };
}
