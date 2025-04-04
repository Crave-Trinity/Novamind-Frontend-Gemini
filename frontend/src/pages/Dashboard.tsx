import React from "react";
import { Link } from "react-router-dom";

/**
 * Dashboard page component
 * Shows overview of patient data and quick access to key features
 */
const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Novamind Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Patient Summary Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">Patient Overview</h2>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Total Patients
            </span>
            <span className="font-medium">24</span>
          </div>
          <div className="mb-2 flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              New This Week
            </span>
            <span className="font-medium">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Upcoming Appointments
            </span>
            <span className="font-medium">7</span>
          </div>
          <div className="mt-4">
            <Link to="/patients" className="text-blue-600 hover:underline dark:text-blue-400">
              View All Patients
            </Link>
          </div>
        </div>

        {/* Brain Visualization Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">Brain Visualizations</h2>
          <div className="flex h-40 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
            <span className="text-gray-500 dark:text-gray-400">
              Brain model preview
            </span>
          </div>
          <div className="mt-4">
            <Link to="/brain-visualization/demo" className="text-blue-600 hover:underline dark:text-blue-400">
              Access Visualizations
            </Link>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold">Treatment Analytics</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">
                Success Rate
              </span>
              <span className="font-medium">78%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2.5 w-[78%] rounded-full bg-green-600"
              ></div>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/analytics" className="text-blue-600 hover:underline dark:text-blue-400">
              Full Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
