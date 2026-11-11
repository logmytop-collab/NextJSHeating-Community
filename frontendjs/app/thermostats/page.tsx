"use client";

import { Suspense } from "react";
import { RenderThermostatsPage } from "../components/RenderThermostatsPage";

export default function SettingsPage() {
  console.log("render page settings");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RenderThermostatsPage></RenderThermostatsPage>
    </Suspense>
  );
}
