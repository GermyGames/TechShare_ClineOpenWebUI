import React from "react";
import { Paper, Stack, Group, TextInput, Select, Button, Text } from "@mantine/core";
import { SourcesPanelProps } from "./types/SourceTypes";
import { paperStyles, buttonStyles } from "./styles/SourcesPanelStyles";
import SourceItem from "./SourceItem";

const SourcesPanel: React.FC<SourcesPanelProps> = ({
  newSource,
  setNewSource,
  addNewSource,
  filteredSources,
  toggleSourceSelection,
  deleteSource,
  updateSourceFlairs,
}) => (
  <Stack gap="xl">
    {/* Add New Source */}
    <Paper shadow="xs" p="sm" radius="md" withBorder styles={paperStyles}>
      <Text size="lg" fw={600} mb={8}>
        Add New Source
      </Text>
      <Stack gap="sm">
        <TextInput
          placeholder="Source name"
          value={newSource.name}
          size="sm"
          onChange={(e) => setNewSource({ ...newSource, name: e.currentTarget.value })}
        />
        <TextInput
          placeholder="URL"
          value={newSource.url}
          size="sm"
          onChange={(e) => setNewSource({ ...newSource, url: e.currentTarget.value })}
        />
        <Group gap={8} align="flex-end">
          <Select
            value={newSource.type}
            onChange={(value) =>
              setNewSource({ ...newSource, type: value as "reddit" | "youtube" })
            }
            data={[
              { value: "reddit", label: "Reddit" },
              { value: "youtube", label: "YouTube" },
            ]}
            style={{ minWidth: 100 }}
            size="sm"
          />
          <Button onClick={addNewSource} styles={buttonStyles} size="sm">
            Add Source
          </Button>
        </Group>
      </Stack>
    </Paper>

    {/* Source List */}
    <Paper shadow="xs" p="sm" radius="md" withBorder styles={paperStyles}>
      <Text size="lg" fw={600} mb={8}>
        My Sources
      </Text>
      {filteredSources.length > 0 ? (
        <Stack gap={4}>
          {filteredSources.map((source) => (
            <SourceItem
              key={source.id}
              source={source}
              onToggleSelection={toggleSourceSelection}
              onDelete={deleteSource}
              onUpdateFlairs={updateSourceFlairs}
            />
          ))}
        </Stack>
      ) : (
        <Text ta="center" color="dimmed" size="md" style={{ paddingTop: 16, paddingBottom: 16 }}>
          No sources found
        </Text>
      )}
    </Paper>
  </Stack>
);

export default SourcesPanel;