import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import { auditLogService, AuditEventType } from "@infrastructure/services/AuditLogService"; // Use correct alias

/**
 * Patient profile page component
 * Shows comprehensive patient information and treatment history
 * Implements HIPAA-compliant PHI access logging
 */
const PatientProfile: React.FC = () => {
  // Get patient ID from URL
  const { id } = useParams<{ id: string }>();

  // Log PHI view for HIPAA compliance
  useEffect(() => {
    if (id) {
      auditLogService.log(AuditEventType.PATIENT_RECORD_VIEW, { // Use correct type
        resourceType: "patient",
        resourceId: id,
        action: "view",
        result: "success",
      });
    }
  }, [id]);

  // Patient data would be fetched from API in a real implementation
  const patientData = {
    id: id || "12345",
    name: "Jane Doe",
    age: 32,
    contactInfo: {
      email: "jane.doe@example.com",
      phone: "(555) 123-4567",
    },
    diagnosis: "Generalized Anxiety Disorder, Major Depressive Disorder",
    treatmentPlan: "CBT + SSRI medication",
    lastVisit: "2025-03-15",
    upcomingAppointment: "2025-04-05",
  };

  // Log brain model access when viewing that tab
  const handleBrainModelView = () => {
    auditLogService.log(AuditEventType.BRAIN_MODEL_VIEW, {
      resourceType: "brainModel",
      // patientId: id, // Remove invalid property
      action: "view",
      result: "success",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800">
        {/* Patient header */}
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">{patientData.name}</h1>
          <p className="text-blue-100">Patient ID: {patientData.id}</p>
        </div>

        {/* Content tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button className="border-b-2 border-blue-500 px-6 py-4 font-medium text-blue-600 dark:text-blue-400">
              Overview
            </button>
            <button
              className="px-6 py-4 font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={handleBrainModelView}
            >
              Brain Model
            </button>
            <button className="px-6 py-4 font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Treatment History
            </button>
            <button className="px-6 py-4 font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              Notes
            </button>
          </nav>
        </div>

        {/* Patient information */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Personal Information
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Age:</span>
                  <span className="ml-2">{patientData.age}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Email:
                  </span>
                  <span className="ml-2">{patientData.contactInfo.email}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Phone:
                  </span>
                  <span className="ml-2">{patientData.contactInfo.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-semibold">
                Medical Information
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Diagnosis:
                  </span>
                  <div className="mt-1">{patientData.diagnosis}</div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Treatment Plan:
                  </span>
                  <div className="mt-1">{patientData.treatmentPlan}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Appointments</h2>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Last Visit</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {patientData.lastVisit}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Upcoming Appointment</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {patientData.upcomingAppointment}
                  </p>
                </div>
                <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Schedule New
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex justify-end space-x-4">
            <button className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              Download Records
            </button>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Edit Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
