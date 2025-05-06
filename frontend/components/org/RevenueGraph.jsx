"use client";

import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const RevenueGraph = () => {
    const [revenueData, setRevenueData] = useState(null);

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                // Get JWT Token
                const token = localStorage.getItem('token'); // Or use cookies

                if (!token) {
                    console.error("No JWT found, user not authenticated");
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/organiser/revenue`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    credentials: "include", // Ensures JWT is included in the request
                });

                console.log("Response status:", response.status);

                if (!response.ok) {
                    throw new Error("Failed to fetch revenue data");
                }

                const data = await response.json();
                console.log("Revenue data received:", data);
                setRevenueData(data);
            } catch (error) {
                console.error("Error fetching revenue data:", error);
            }
        };

        fetchRevenue();
    }, []);

    if (!revenueData) {
        return <p>Loading revenue data...</p>;
    }

    return (
        <div className="w-full h-64">
            <h2 className="text-lg font-semibold mb-2">Total Revenue: ${revenueData.totalRevenue}</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.tournamentRevenueData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#4F46E5" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueGraph;
