/* eslint-disable react/prefer-stateless-function */
const { ipcRenderer } = require('electron');
import React, { ReactNode, Component, ErrorInfo } from 'react';
import { Accordion, Box, Center, Code, Container, Kbd, Text, Title } from '@mantine/core';
import packageJson from '../../../../package.json';
import ipcChannels from '../../../common/constants/ipcChannels.json';

const LOGS_DIR = await ipcRenderer.invoke(ipcChannels.GET_PATH.LOGS_DIR);

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

// eslint-disable-next-line import/prefer-default-export
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });
    console.debug('Caught error in ErrorBoundary, relaying details below...');
    console.error(error, errorInfo);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Container>
          <Center>
            <Box style={{ maxWidth: 500 }} mt={80}>
              <Title order={3}>Sorry, something went wrong.</Title>
              <Text>
                An error occurred while loading the page. Normally we would show more specific
                information, but the error caused the renderer to break, so we can only show you
                this page instead.
              </Text>
              <Title order={4} mt="xs">
                What to do
              </Title>
              <Box ml="lg">
                <Text>
                  - Press <Kbd>Ctrl</Kbd>+<Kbd>R</Kbd> to reload the client.
                </Text>
                <Text>
                  - You can open the console by pressing <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+
                  <Kbd>I</Kbd>, which may contain additional information about the error.
                </Text>
                <Text>
                  -{' '}
                  <Text
                    variant="link"
                    component="a"
                    style={{ cursor: 'pointer' }}
                    href={`${packageJson.repository.url}/issues`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Report an issue on GitHub
                  </Text>
                  . Please copy the expanded error information below, as well as the steps you took
                  before seeing this page.
                </Text>
              </Box>
              <Title order={4} mt="xs">
                Error details
              </Title>
              <Text>
                Additional logs in{' '}
                <Code>
                  <Text
                    variant="link"
                    component="a"
                    href={`file:///${LOGS_DIR}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {LOGS_DIR}
                  </Text>
                </Code>
              </Text>

              <Accordion mt="xs">
                <Accordion.Item value="details">
                  <Accordion.Control>
                    {this.state.error.name}: {this.state.error.message}
                  </Accordion.Control>
                  <Accordion.Panel>{this.state.error.stack}</Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Box>
          </Center>
        </Container>
      );
    }
    return this.props.children;
  }
}
