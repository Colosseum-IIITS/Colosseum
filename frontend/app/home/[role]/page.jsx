// app/player/home/page.jsx
import React from 'react';

async function fetchData() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/player/homepage`, {
    headers: {
      Authorization: `Bearer ${process.env.YOUR_API_KEY}`,  // Add your token or other auth headers here
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
}

export default async function HomePage() {
  const data = await fetchData();  // Fetch the data

  return (
    <div>
      {/* Use the data here */}
      <h1>Welcome {data.user}</h1>
      {/* Add more data rendering as needed */}
    </div>
  );
}
