const { ipcRenderer } = require('electron');
import { ReactNode, Component, ErrorInfo } from 'react';
import { Accordion, Box, Center, Kbd } from '@mantine/core';
import packageJson from '../../../../package.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import DefaultText from './DefaultText';
import styles from './ErrorBoundary.module.css';
import DefaultTitle from './DefaultTitle';
import DefaultAccordion from './DefaultAccordion';

const LOGS_DIR = await ipcRenderer.invoke(ipcChannels.GET_PATH.LOGS_DIR);

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

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
        <Box className={styles.root}>
          <Center>
            <Box className={styles.content} mt={80}>
              <DefaultTitle order={3}>Sorry, something went wrong.</DefaultTitle>
              <DefaultText>
                An error occurred while loading the page. Normally we would show more specific
                information, but the error caused the renderer to break, so we can only show you
                this page instead.
              </DefaultText>
              <DefaultTitle order={4} mt="xs">
                What to do
              </DefaultTitle>
              <Box ml="lg">
                <DefaultText>
                  - Press <Kbd>Ctrl</Kbd>+<Kbd>R</Kbd> to reload the client.
                </DefaultText>
                <DefaultText>
                  - You can open the console by pressing <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+
                  <Kbd>I</Kbd>, which may contain additional information about the error.
                </DefaultText>
                <DefaultText>
                  -{' '}
                  <DefaultText
                    style={{ textDecorationLine: 'underline' }}
                    component="a"
                    href={`${packageJson.repository.url}/issues`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Report an issue on GitHub
                  </DefaultText>
                  . Please copy the expanded error information below, as well as the steps you took
                  before seeing this page.
                </DefaultText>
              </Box>
              <DefaultTitle order={4} mt="xs">
                Error details
              </DefaultTitle>
              <DefaultText>
                Additional logs in{' '}
                <DefaultText
                  style={{ textDecorationLine: 'underline' }}
                  component="a"
                  href={`file:///${LOGS_DIR}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {LOGS_DIR}
                </DefaultText>
              </DefaultText>

              <DefaultAccordion mt="xs">
                <Accordion.Item value="details">
                  <Accordion.Control>
                    {this.state.error.name}: {this.state.error.message}
                  </Accordion.Control>
                  <Accordion.Panel>
                    <DefaultText>{this.state.error.stack}</DefaultText>
                  </Accordion.Panel>
                </Accordion.Item>
              </DefaultAccordion>
            </Box>
          </Center>
        </Box>
      );
    }
    return this.props.children;
  }
}
