"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  CloudRainIcon,
  CloudSnowIcon,
  CloudIcon,
  SunIcon,
  MapPinIcon,
  WindIcon,
  DropletIcon,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [location, setLocation] = useState<string>("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  return <div></div>;
}
