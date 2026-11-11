"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React, { Suspense } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { RenderRoomPage } from "../components/RenderRoomPage";

interface UserData {
  userId: string;
  email: string;
  name: string;
}

function DashboardPage() {
  const router = useRouter();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RenderRoomPage></RenderRoomPage>
    </Suspense>
  );
}

export default DashboardPage;
