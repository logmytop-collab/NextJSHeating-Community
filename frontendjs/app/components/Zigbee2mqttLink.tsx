"use client";

import { useEffect, useState } from "react";

export function Zigbee2mqttLink() {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  return (
    <div className="flex justify-center gap-2  mt-2">
      <a
        className="inline-flex items-center px-6 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        href={`http://${hostname}:8080`}
      >
        Zigbee2MQTT
      </a>
    </div>
  );
}
