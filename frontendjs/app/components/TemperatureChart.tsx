"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { Room, Thermostat } from "../api/lib/types";
import { useEffect, useState } from "react";
import { loadingModus, myFetch } from "./helper/fetchRoomsHelper";
import { useRouter } from "next/navigation";

interface TemperaturePoint {
  temperature: number;
  humidity: number;
  updated_at: string;
}

interface TemperatureChartProps {
  thermostat: Thermostat; // Required text for the button
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({
  thermostat,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TemperaturePoint[]>();
  const [selectedTab, setSelectedTab] = useState("day");
  const [isLoading, setIsLoading] = useState<loadingModus>(loadingModus.done);

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [data]); // Runs only once

  useEffect(() => {
    (async () => {
      //await getMySheets();

      setIsLoading(loadingModus.loading);
    })(); //console.log("useEffect BoardRoom ", JSON.stringify(content));
  }, [selectedTab]); // Runs only once

  useEffect(() => {
    //console.log("useEffect BoardRoom ", JSON.stringify(content));
    const dummy1 = [
      { updated_at: "09:00", temperature: 21.5, humidity: 45 },
      { updated_at: "09:15", temperature: 21.8, humidity: 47 },
      { updated_at: "09:30", temperature: 22.3, humidity: 46 },
      { updated_at: "09:45", temperature: 22.0, humidity: 44 },
    ];
    const dummy2 = [
      { updated_at: "09:00", temperature: 20.5, humidity: 35 },
      { updated_at: "09:15", temperature: 20.8, humidity: 37 },
      { updated_at: "09:30", temperature: 19.3, humidity: 36 },
      { updated_at: "09:45", temperature: 25.0, humidity: 34 },
    ];

    setData(dummy1);

    (async () => {
      //await getMySheets();
      // setIsLoading(loadingModus.loading);
    })();
  }, []); // Runs only once

  useEffect(() => {
    console.log("useEffect isLoading");

    if (
      isLoading === loadingModus.loading ||
      isLoading === loadingModus.quite
    ) {
      console.log(" await getMySheets() ");
      getLogData();
    } else {
    }
  }, [isLoading]);

  const getLogData = async () => {
    console.log("getAllThermostats ");

    const url = "/api/heating/getLog";
    const data = new FormData();
    const thermostatID = thermostat.id;
    data.append("thermostatID", thermostatID.toString());
    data.append("window", selectedTab);

    await myFetch(url, data, setIsLoading, setError, router, (res: any) => {
      setData(res.logdata);
      setIsLoading(loadingModus.done);
    });
  };

  if (error) return <h1 style={{ color: "red" }}>{error}</h1>;

  function getFormating(value: any): string {
    switch (selectedTab) {
      case "day":
        return new Date(value).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      case "week":
        return new Date(value).toLocaleDateString([], {
          hour: "numeric",
          weekday: "short",
        });
      case "month":
        return new Date(value).toLocaleDateString([], { day: "numeric" });
      case "year":
        return new Date(value).toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
    }
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="w-[100%] flex-col">
      <div className="">
        <h1 className="text-l font-bold">Trend {thermostat.name}</h1>
      </div>
      <div className="h-60 w-[90%]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="updated_at"
              tickFormatter={(value) => getFormating(value)}
              tick={{ fontSize: 12, fill: "black", angle: -35 }}
            />

            <YAxis
              yAxisId="temperature"
              tick={{ fontSize: 12, fill: "#077704" }}
              domain={["dataMin - 1", "dataMax + 1"]}
              axisLine={{ stroke: "#077704" }}
              orientation="left"
              unit="°C"
              tickFormatter={(value) => value.toFixed(1)}
            />

            <YAxis
              yAxisId="humidity"
              orientation="right"
              tick={{ fontSize: 10, fill: "#2563eb" }}
              axisLine={{ stroke: "#2563eb" }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              labelFormatter={(value: any) => new Date(value).toLocaleString()}
            />

            <Line
              type="monotone"
              yAxisId="temperature"
              dataKey="temperature"
              stroke="#077704"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              yAxisId="humidity"
              dataKey="humidity"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
          <Legend />
        </ResponsiveContainer>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex h-8 border-t bg-white">
        <button
          className={`flex-1 text-sm ${
            selectedTab === "day"
              ? "font-semibold text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("day")}
        >
          Day
        </button>

        <button
          className={`flex-1 text-sm ${
            selectedTab === "week"
              ? "font-semibold text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("week")}
        >
          Week
        </button>

        <button
          className={`flex-1 text-sm ${
            selectedTab === "month"
              ? "font-semibold text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("month")}
        >
          Month
        </button>
        <button
          className={`flex-1 text-sm ${
            selectedTab === "year"
              ? "font-semibold text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setSelectedTab("year")}
        >
          Year
        </button>
      </div>
    </div>
  );
};
