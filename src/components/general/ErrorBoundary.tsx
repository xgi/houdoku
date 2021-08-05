/* eslint-disable react/prefer-stateless-function */
import Title from 'antd/lib/typography/Title';
import Paragraph from 'antd/lib/typography/Paragraph';
import log from 'electron-log';
import { ipcRenderer } from 'electron';
import React, { ReactNode, Component, ErrorInfo } from 'react';
import { Collapse } from 'antd';
import styles from './ErrorBoundary.css';
import packageJson from '../../../package.json';
import ipcChannels from '../../constants/ipcChannels.json';

const { Panel } = Collapse;

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  logsDir: string;
}

// eslint-disable-next-line import/prefer-default-export
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      error: null,
      logsDir: '',
    };
  }

  componentDidMount() {
    console.log('MOUNT');
    ipcRenderer
      .invoke(ipcChannels.GET_PATH.LOGS_DIR)
      // eslint-disable-next-line promise/always-return
      .then((logsDir: string) => {
        console.log('here');
        console.log(logsDir);
        this.setState({ logsDir });
      })
      .catch((err: Error) => log.error(err));
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error });
    log.debug('Caught error in ErrorBoundary, relaying details below...');
    log.error(error, errorInfo);
  }

  // eslint-disable-next-line class-methods-use-this
  getDerivedStateFromError(error: Error): State {
    return { ...this.state, error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.spaceContainer}>
          <div className={styles.container}>
            <Title level={3}>Sorry, something went wrong.</Title>
            <Paragraph>
              An error occurred while loading the page. Normally we would show
              more specific information, but the error caused the renderer to
              break, so we can only show you this page instead.
            </Paragraph>
            <Title level={4}>What to do</Title>
            <div className={styles.list}>
              <Paragraph>
                - Press <span className={styles.highlightedText}>Ctrl + R</span>{' '}
                to reload the client.
              </Paragraph>
              <Paragraph>
                - You can open the console by pressing{' '}
                <span className={styles.highlightedText}>Ctrl + Shift + I</span>
                , which may contain additional information about the error.
              </Paragraph>
              <Paragraph>
                -{' '}
                <a
                  href={`${packageJson.repository.url}/issues`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Report an issue on GitHub
                </a>
                . Please copy the expanded error information below, as well as
                the steps you took before seeing this page.
              </Paragraph>
            </div>
            <Title level={4}>Error details</Title>
            <Paragraph>
              Additional logs in{' '}
              <span className={styles.highlightedText}>
                <a
                  href={`file:///${this.state.logsDir}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {this.state.logsDir}
                </a>
              </span>
            </Paragraph>
            <Collapse className={styles.errorCollapse} defaultActiveKey={[]}>
              <Panel
                header={`${this.state.error.name}: ${this.state.error.message}`}
                key="1"
              >
                <p>{this.state.error.stack}</p>
              </Panel>
            </Collapse>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
