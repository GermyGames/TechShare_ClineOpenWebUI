import React from "react";
import { Group, Checkbox, Badge, Button, Text, TextInput, Stack } from "@mantine/core";
import { Source } from "./types/SourceTypes";
import { sourceItemStyles, buttonStyles, badgeStyles } from "./styles/SourcesPanelStyles";
import { colors } from '../../theme/colors';
import { branding } from '../../theme/branding';

interface SourceItemProps {
  source: Source;
  onToggleSelection: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdateFlairs: (id: number, flairs: string[]) => void;
}

const SourceItem: React.FC<SourceItemProps> = ({
  source,
  onToggleSelection,
  onDelete,
  onUpdateFlairs,
}) => (
  <Group
    justify="space-between"
    align="center"
    p={4}
    styles={{
      root: {
        ...sourceItemStyles.root,
        background: source.selected ? colors.hoverBgColor : "transparent",
      }
    }}
  >
    <Group gap={6}>
      <Checkbox
        checked={source.selected}
        onChange={() => onToggleSelection(source.id)}
        size="sm"
      />
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Text fw={500} size="sm" truncate="end">
          {source.name}
        </Text>
        <Text size="xs" color="dimmed" truncate="end">
          {source.url}
        </Text>
        {source.type === "reddit" && (
          <TextInput
            label="Flairs (comma separated)"
            value={source.flairs?.join(", ") || ""}
            onChange={(e) => {
              const flairs = e.currentTarget.value
                .split(",")
                .map(f => f.trim())
                .filter(f => f.length > 0);
              onUpdateFlairs(source.id, flairs);
            }}
            size="xs"
            placeholder="e.g. Paper, Discussion"
            style={{ marginTop: 4 }}
          />
        )}
      </Stack>
    </Group>
    <Group gap={6}>
      <Badge
        color={source.type === "reddit" ? colors.redditOrange : branding.primaryColor}
        styles={{
          root: {
            ...badgeStyles.root,
            background: source.type === "reddit"
              ? colors.redditOrange
              : branding.primaryColor,
          }
        }}
        size="sm"
        radius="sm"
        variant="light"
      >
        {source.type === "reddit" ? "Reddit" : "YouTube"}
      </Badge>
      <Button
        styles={buttonStyles}
        variant="light"
        size="xs"
        onClick={() => onDelete(source.id)}
      >
        Delete
      </Button>
    </Group>
  </Group>
);

export default SourceItem; 