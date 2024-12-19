const { ipcRenderer } = require('electron');
import { ReactNode, Component, ErrorInfo } from 'react';
import packageJson from '../../../../package.json';
import ipcChannels from '@/common/constants/ipcChannels.json';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@houdoku/ui/components/Accordion';

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
        <div className="w-full min-h-full flex justify-center">
          <div className="max-w-[500px] mt-[80px]">
            <h3 className="font-bold text-2xl">Sorry, something went wrong.</h3>
            <p>
              An error occurred while loading the page. Normally we would show more specific
              information, but the error caused the renderer to break, so we can only show you this
              page instead.
            </p>
            <h4 className="font-bold text-xl pt-2">What to do</h4>
            <div className="ml-2">
              <p>
                - Press{' '}
                <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                  Ctrl + R
                </code>{' '}
                to reload the client.
              </p>
              <p>
                - You can open the console by pressing{' '}
                <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                  Ctrl + Shift + I
                </code>
                , which may contain additional information about the error.
              </p>
              <p>
                -{' '}
                <a
                  className="underline"
                  href={`${packageJson.repository.url}/issues`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Report an issue on GitHub
                </a>
                . Please copy the expanded error information below, as well as the steps you took
                before seeing this page.
              </p>
            </div>
            <h4 className="font-bold text-xl pt-2">Error details</h4>
            <p>
              Additional logs in{' '}
              <a
                className="underline"
                href={`file:///${LOGS_DIR}`}
                target="_blank"
                rel="noreferrer"
              >
                {LOGS_DIR}
              </a>
            </p>

            <Accordion type="single">
              <AccordionItem value="details">
                <AccordionTrigger>
                  {this.state.error.name}: {this.state.error.message}
                </AccordionTrigger>
                <AccordionContent>{this.state.error.stack}</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
