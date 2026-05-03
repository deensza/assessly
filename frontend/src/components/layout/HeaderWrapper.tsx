"use client";

import { usePathname } from "next/navigation";
import MoodleHeader from "./MoodleHeader";

export default function HeaderWrapper() {
  const pathname = usePathname();
  
  // Login sayfasında header'ı gösterme
  if (pathname === "/login") return null;
  
  return <MoodleHeader />;
}
