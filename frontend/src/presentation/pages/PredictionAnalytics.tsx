import React, { useState } from 'react';
import { DocumentTitle, Card } from '../atoms';
import { Header, Chart } from '../molecules';
import MainLayout from '../templates/MainLayout';

/**
 * PredictionAnalytics page component
 * 
 * This page provides analytics and visualization of prediction models and their performance
 */
const PredictionAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [modelType, setModelType] = useState<'all' | 'relapse' | 'suicide' | 'treatment'>('all');

  // Mock data for visualization
  const performanceData = {
    accuracyByModel: {
      labels: ['Relapse Risk', 'Suicide Risk', 'SSRI Response', 'Therapy Response', 'Treatment Outcome'],
      datasets: [
        {
          label: 'Accuracy',
          data: [0.82, 0.86, 0.79, 0.77, 0.81],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'AUC-ROC',
          data: [0.88, 0.91, 0.83, 0.81, 0.85],
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    },
    predictionsOverTime: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Total Predictions',
          data: [65, 78, 92, 117, 131, 156],
          fill: false,
          borderColor: 'rgba(54, 162, 235, 1)',
          tension: 0.1
        }
      ]
    },
    featureImportance: {
      labels: ['PHQ-9 Score', 'Previous Relapses', 'Medication Adherence', 'Social Support', 'Sleep Quality'],
      datasets: [
        {
          label: 'Feature Importance',
          data: [0.28, 0.22, 0.18, 0.16, 0.14],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderWidth: 1,
        }
      ]
    }
  };

  return (
    <>
      <DocumentTitle title="Prediction Analytics | Novamind Digital Twin" />
      <MainLayout>
        <Header title="Prediction Analytics" subtitle="Model performance and prediction insights" />
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <select 
              className="bg-gray-800 text-white border border-gray-700 rounded-md p-2 w-full"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="flex-1">
            <select 
              className="bg-gray-800 text-white border border-gray-700 rounded-md p-2 w-full"
              value={modelType}
              onChange={(e) => setModelType(e.target.value as any)}
            >
              <option value="all">All Models</option>
              <option value="relapse">Relapse Risk</option>
              <option value="suicide">Suicide Risk</option>
              <option value="treatment">Treatment Response</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Predictions Over Time">
            <Chart 
              type="line" 
              data={performanceData.predictionsOverTime} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Prediction Volume Trends'
                  }
                }
              }}
            />
          </Card>
          <Card title="Model Accuracy Comparison">
            <Chart 
              type="bar" 
              data={performanceData.accuracyByModel} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Performance Metrics by Model'
                  }
                }
              }}
            />
          </Card>
        </div>

        <div className="mb-6">
          <Card title="Feature Importance">
            <Chart 
              type="doughnut" 
              data={performanceData.featureImportance} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                  title: {
                    display: true,
                    text: 'Top 5 Features by Importance'
                  }
                }
              }}
            />
          </Card>
        </div>

        <div className="mb-6">
          <Card title="Model Performance Details">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-900 text-white">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="px-4 py-2 text-left">Model</th>
                    <th className="px-4 py-2 text-left">Accuracy</th>
                    <th className="px-4 py-2 text-left">Precision</th>
                    <th className="px-4 py-2 text-left">Recall</th>
                    <th className="px-4 py-2 text-left">F1 Score</th>
                    <th className="px-4 py-2 text-left">AUC-ROC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-2">Relapse Risk</td>
                    <td className="px-4 py-2">82%</td>
                    <td className="px-4 py-2">79%</td>
                    <td className="px-4 py-2">85%</td>
                    <td className="px-4 py-2">82%</td>
                    <td className="px-4 py-2">88%</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-2">Suicide Risk</td>
                    <td className="px-4 py-2">86%</td>
                    <td className="px-4 py-2">84%</td>
                    <td className="px-4 py-2">87%</td>
                    <td className="px-4 py-2">85%</td>
                    <td className="px-4 py-2">91%</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-2">SSRI Response</td>
                    <td className="px-4 py-2">79%</td>
                    <td className="px-4 py-2">76%</td>
                    <td className="px-4 py-2">81%</td>
                    <td className="px-4 py-2">78%</td>
                    <td className="px-4 py-2">83%</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-2">Therapy Response</td>
                    <td className="px-4 py-2">77%</td>
                    <td className="px-4 py-2">75%</td>
                    <td className="px-4 py-2">79%</td>
                    <td className="px-4 py-2">77%</td>
                    <td className="px-4 py-2">81%</td>
                  </tr>
                  <tr className="border-t border-gray-700">
                    <td className="px-4 py-2">Treatment Outcome</td>
                    <td className="px-4 py-2">81%</td>
                    <td className="px-4 py-2">78%</td>
                    <td className="px-4 py-2">83%</td>
                    <td className="px-4 py-2">80%</td>
                    <td className="px-4 py-2">85%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </MainLayout>
    </>
  );
};

export default PredictionAnalytics;
