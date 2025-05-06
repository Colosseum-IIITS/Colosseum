'use client';
import React, { useState } from 'react';

const apiRoutes = [
  {
    group: 'B2B (Business-to-Business)',
    basePath: 'http://localhost:5000/b2b',
    routes: [
      {
        method: 'GET',
        path: '/stats',
        description: 'Returns business stats like total tournaments, revenue, and teams.',
      },
      {
        method: 'GET',
        path: '/average-revenue',
        description: 'Fetches the average revenue generated per tournament.',
      },
      {
        method: 'GET',
        path: '/total-team-joins',
        description: 'Gets the total number of team joins across all tournaments.',
      },
      {
        method: 'GET',
        path: '/tournament-growth',
        description: 'Provides tournament growth data over time.',
      },
    ],
  },
  {
    group: 'B2C (Business-to-Consumer)',
    basePath: 'http://localhost:5000/b2c',
    routes: [
      {
        method: 'GET',
        path: '/stats',
        description: 'Returns public stats like number of players, teams, and tournaments.',
      },
      {
        method: 'GET',
        path: '/tournament-status',
        description: 'Provides a breakdown of tournaments by status (upcoming, ongoing, completed).',
      },
      {
        method: 'GET',
        path: '/top-rated-organisers',
        description: 'Returns the count of top-rated organizers.',
      },
      {
        method: 'GET',
        path: '/average-players-per-team',
        description: 'Gives the average number of players per team.',
      },
    ],
  },
];

const ApiDocs = () => {
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  const handleRouteClick = async (basePath, route) => {
    const routeKey = `${basePath}${route.path}`;

    // Toggle visibility
    setResponses((prev) => ({
      ...prev,
      [routeKey]: prev[routeKey] ? null : prev[routeKey], // Toggle visibility
    }));

    // If already fetched and toggling visibility, skip fetching again
    if (responses[routeKey]) return;

    setLoading((prev) => ({ ...prev, [routeKey]: true }));

    try {
      const res = await fetch(routeKey);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [routeKey]: data }));
    } catch (err) {
      setResponses((prev) => ({
        ...prev,
        [routeKey]: { error: `Failed to fetch: ${err.message}` },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [routeKey]: false }));
    }
  };

  return (
    <div className="p-8 font-sans">
      <h1 className="text-4xl font-bold mb-8">📘 API Documentation</h1>

      {apiRoutes.map((section, index) => (
        <div key={index} className="mb-12">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">{section.group}</h2>
          <p className="text-gray-700 mb-2">
            Base URL:{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">{section.basePath}</code>
          </p>
          <div className="space-y-4 mt-4">
            {section.routes.map((route, idx) => {
              const routeKey = `${section.basePath}${route.path}`;
              return (
                <div
                  key={idx}
                  className="border border-gray-200 rounded p-4 shadow-sm cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRouteClick(section.basePath, route)}
                >
                  <p className="text-sm font-mono text-green-600">{route.method}</p>
                  <p className="text-lg font-medium">{route.path}</p>
                  <p className="text-gray-600 mt-1">{route.description}</p>
                  {responses[routeKey] && (
                    <div className="mt-4 bg-gray-100 p-4 rounded">
                      {loading[routeKey] ? (
                        <p className="text-blue-500">Loading...</p>
                      ) : (
                        <pre className="text-sm text-gray-800">
                          {JSON.stringify(responses[routeKey], null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApiDocs;