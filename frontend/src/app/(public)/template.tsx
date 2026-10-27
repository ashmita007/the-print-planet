import React from "react";

export default function PublicTemplate({ children }: { children: React.ReactNode }) {
  return <div className="anim-fade-in">{children}</div>;
}
