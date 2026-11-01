import React from "react";
import OwnerMotion from "@/components/animations/OwnerMotion";

export default function OwnerTemplate({ children }: { children: React.ReactNode }) {
  return <OwnerMotion>{children}</OwnerMotion>;
}
