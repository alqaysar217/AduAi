
import React from 'react';

export default function ToolsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // This layout applies to all pages within the /tools directory, including /tools/podcast-generator
  return <>{children}</>;
}

    