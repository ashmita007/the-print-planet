import React from "react";
import PageReveal from "@/components/animations/PageReveal";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-fade-in">
      <PageReveal>{children}</PageReveal>
    </div>
  );
}
