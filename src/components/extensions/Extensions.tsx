import React, { useEffect, useState } from 'react';
import aki, { RegistrySearchResults } from 'aki-plugin-manager';
import log from 'electron-log';
import { useLocation } from 'react-router-dom';
import { Button, Group, Input, Loader, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import ExtensionTable from './ExtensionTable';
import InstalledExtensionsModal from './InstalledExtensionsModal';
import ExtensionSettingsModal from './ExtensionSettingsModal';

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

const Extensions: React.FC<Props> = (props: Props) => {
  const [searchResults, setSearchResults] = useState<RegistrySearchResults>();
  const [filterText, setFilterText] = useState('');
  const [showingInstalledModal, setShowingInstalledModal] = useState(false);
  const [showingSettingsModal, setShowingSettingsModal] = useState(false);
  const [settingsModalExtension, setSettingsModalExtension] = useState('');
  const location = useLocation();

  const doSearchRegistry = () => {
    log.debug(`Searching extension registry...`);

    setSearchResults(undefined);
    aki
      .search('extension', 'houdoku', 100)
      .then((results: RegistrySearchResults) => {
        log.debug(`Extension registry search found ${results.total} results`);
        return setSearchResults(results);
      })
      .catch((e) => log.error(e));
  };

  const showSettingsModal = (extensionId: string) => {
    setSettingsModalExtension(extensionId);
    setShowingSettingsModal(true);
  };

  useEffect(() => {
    doSearchRegistry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return (
    <>
      <InstalledExtensionsModal
        visible={showingInstalledModal}
        toggleVisible={() => setShowingInstalledModal(!showingInstalledModal)}
      />
      <ExtensionSettingsModal
        visible={showingSettingsModal}
        toggleVisible={() => setShowingSettingsModal(!showingSettingsModal)}
        extensionId={settingsModalExtension}
      />
      <Group position="apart" mb="md" noWrap>
        <Group position="left" align="left" spacing="xs" noWrap>
          <Button variant="default" onClick={() => doSearchRegistry()}>
            Refresh Extension List
          </Button>
          <Button variant="default" onClick={() => setShowingInstalledModal(true)}>
            View Installed Extensions
          </Button>
        </Group>
        <Group position="right" align="right" noWrap>
          <Input
            placeholder="Filter extensions..."
            icon={<IconSearch size={16} />}
            value={filterText}
            onChange={(e: any) => setFilterText(e.target.value)}
          />
        </Group>
      </Group>

      {searchResults === undefined ? (
        <>
          <Group position="center" mt="xl" mb="sm">
            <Loader />
            <Text>Loading extension list...</Text>
            {/* <Spin />
          <Paragraph>Loading extension list...</Paragraph>
          <Paragraph>This requires an internet connection.</Paragraph> */}
          </Group>
          <Text align="center">This requires an internet connection.</Text>
        </>
      ) : (
        <ExtensionTable
          registryResults={searchResults}
          filterText={filterText}
          showExtensionSettingsModal={(extensionId: string) => showSettingsModal(extensionId)}
        />
      )}
    </>
  );
};

export default Extensions;
