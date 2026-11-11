"use client";

import { Suspense } from "react";

import { RenderSettingsPage } from "../components/RenderSettingsPage";

export default function SettingsPage() {
  console.log("render page settings");

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RenderSettingsPage></RenderSettingsPage>
    </Suspense>
  );
}
