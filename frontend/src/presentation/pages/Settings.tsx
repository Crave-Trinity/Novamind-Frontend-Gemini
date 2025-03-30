import React, { useState } from "react"; // Removed unused useEffect

// Import components from index files for better organization following clean architecture
import { useTheme } from "../../application/hooks/useTheme"; // Correct hook path
import { ThemeOption } from "../../types/theme"; // Import correct type
import { DocumentTitle, Card, Button } from "../atoms";
import { Header } from "../molecules";
import MainLayout from "../templates/MainLayout";

/**
 * Settings page component
 *
 * This page allows users to configure application settings, preferences, and account details
 */
const Settings: React.FC = () => {
  // Removed unused isDarkMode, toggleDarkMode
  const { theme, setTheme } = useTheme();
  // Removed unused selectedTheme state
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    riskAlerts: true,
    treatmentAlerts: true,
    outcomeAlerts: true,
  });
  const [dataPrivacySettings, setDataPrivacySettings] = useState({
    anonymizeData: true,
    shareForResearch: false,
    dataRetentionPeriod: "1-year",
  });
  const [visualizationSettings, setVisualizationSettings] = useState({
    showConfidenceIntervals: true,
    defaultModelView: "3d",
    colorMode: "clinical",
  });

  // Theme toggle handler
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeValue = e.target.value as ThemeOption; // Use ThemeOption
    setTheme(themeValue);
  };

  // Notification settings handler
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Data privacy settings handler
  const handleDataPrivacyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setDataPrivacySettings((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Visualization settings handler
  const handleVisualizationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setVisualizationSettings((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  // Save all settings
  const handleSaveSettings = () => {
    // In a real app, we would call the API to save user settings
    console.log("Saving settings...");
    console.log({
      theme,
      notificationSettings,
      dataPrivacySettings,
      visualizationSettings,
    });

    // Show success message
    alert("Settings saved successfully!");
  };

  return (
    <>
      <DocumentTitle title="Settings | Novamind Digital Twin" />
      <MainLayout>
        <Header title="Settings" subtitle="Configure your experience" />

        <div className="mb-6 grid grid-cols-1 gap-6">
          <Card title="Theme Settings">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Interface Theme
              </label>
              <select
                className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
                value={theme}
                onChange={handleThemeChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="clinical">Clinical</option>
                <option value="sleek-dark">Sleek Dark</option>
              </select>
            </div>
          </Card>

          <Card title="Notification Preferences">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailAlerts"
                  name="emailAlerts"
                  checked={notificationSettings.emailAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="emailAlerts"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Email Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsAlerts"
                  name="smsAlerts"
                  checked={notificationSettings.smsAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="smsAlerts"
                  className="ml-2 block text-sm text-gray-300"
                >
                  SMS Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="riskAlerts"
                  name="riskAlerts"
                  checked={notificationSettings.riskAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="riskAlerts"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Risk Assessment Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="treatmentAlerts"
                  name="treatmentAlerts"
                  checked={notificationSettings.treatmentAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="treatmentAlerts"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Treatment Response Alerts
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="outcomeAlerts"
                  name="outcomeAlerts"
                  checked={notificationSettings.outcomeAlerts}
                  onChange={handleNotificationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="outcomeAlerts"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Outcome Prediction Alerts
                </label>
              </div>
            </div>
          </Card>

          <Card title="Data Privacy">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymizeData"
                  name="anonymizeData"
                  checked={dataPrivacySettings.anonymizeData}
                  onChange={handleDataPrivacyChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="anonymizeData"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Anonymize Data for Research
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shareForResearch"
                  name="shareForResearch"
                  checked={dataPrivacySettings.shareForResearch}
                  onChange={handleDataPrivacyChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="shareForResearch"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Allow Anonymized Data Sharing
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Data Retention Period
                </label>
                <select
                  className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
                  name="dataRetentionPeriod"
                  value={dataPrivacySettings.dataRetentionPeriod}
                  onChange={handleDataPrivacyChange}
                >
                  <option value="6-months">6 Months</option>
                  <option value="1-year">1 Year</option>
                  <option value="2-years">2 Years</option>
                  <option value="5-years">5 Years</option>
                  <option value="indefinite">Indefinite</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="Visualization Preferences">
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showConfidenceIntervals"
                  name="showConfidenceIntervals"
                  checked={visualizationSettings.showConfidenceIntervals}
                  onChange={handleVisualizationChange}
                  className="h-4 w-4 rounded text-blue-600"
                />
                <label
                  htmlFor="showConfidenceIntervals"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Show Confidence Intervals
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Default Model View
                </label>
                <select
                  className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
                  name="defaultModelView"
                  value={visualizationSettings.defaultModelView}
                  onChange={handleVisualizationChange}
                >
                  <option value="3d">3D Model</option>
                  <option value="2d">2D Cross-section</option>
                  <option value="network">Network Graph</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Color Mode
                </label>
                <select
                  className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-white"
                  name="colorMode"
                  value={visualizationSettings.colorMode}
                  onChange={handleVisualizationChange}
                >
                  <option value="clinical">Clinical</option>
                  <option value="contrast">High Contrast</option>
                  <option value="gradient">Gradient</option>
                  <option value="monochrome">Monochrome</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} variant="primary">
              Save Settings
            </Button>
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export default Settings;
