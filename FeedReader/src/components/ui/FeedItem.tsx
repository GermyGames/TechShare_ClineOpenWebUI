import React from "react";
import { Paper } from "@mantine/core";

interface FeedItemProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const FeedItem: React.FC<FeedItemProps> = ({ children, style }) => (
  <Paper
    shadow="xs"
    p="sm"
    radius="md"
    withBorder
    style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border-light)",
      width: "100%",
      boxSizing: "border-box",
      ...style,
    }}
  >
    {children}
  </Paper>
);

export default FeedItem;