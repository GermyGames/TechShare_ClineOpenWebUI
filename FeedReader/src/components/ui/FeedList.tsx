import React from "react";
import { Stack, Loader, Center, Text } from "@mantine/core";

interface FeedListProps<T> {
  items: T[];
  loading: boolean;
  renderItem: (item: T) => React.ReactNode;
  emptyText?: string;
}

function FeedList<T>({ items, loading, renderItem, emptyText = "No results found" }: FeedListProps<T>) {
  return (
    <Stack gap="sm">
      {loading ? (
        <Center style={{ height: "10rem" }}>
          <Loader size="lg" />
        </Center>
      ) : items.length > 0 ? (
        items.map((item, idx) => (
          <React.Fragment key={idx}>{renderItem(item)}</React.Fragment>
        ))
      ) : (
        <Text ta="center" color="dimmed" size="md" style={{ paddingTop: 16, paddingBottom: 16 }}>
          {emptyText}
        </Text>
      )}
    </Stack>
  );
}

export default FeedList;