import * as React from 'react';
import {
  BookOpenIcon,
  KeyboardIcon,
  LibraryBigIcon,
  LucideProps,
  NotebookTextIcon,
  SettingsIcon,
  ToyBrickIcon,
} from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/components/Breadcrumb';
import { DialogContent, DialogTitle } from '@/ui/components/Dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/ui/components/Sidebar';
import { useState } from 'react';
import { SettingsGeneral } from './SettingsGeneral';
import { SettingsLibrary } from './SettingsLibrary';
import { SettingsReader } from './SettingsReader';
import { SettingsKeybinds } from './SettingsKeybinds';
import { SettingsIntegrations } from './SettingsIntegrations';
import { SettingsTrackers } from './SettingsTrackers';

export enum SettingsPage {
  General = 'General',
  Library = 'Library',
  Reader = 'Reader',
  Keybinds = 'Keybinds',
  Trackers = 'Trackers',
  Integrations = 'Integrations',
}

type SettingsPageProps = {
  name: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  component: React.FC;
};

const PAGES: { [key in SettingsPage]: SettingsPageProps } = {
  [SettingsPage.General]: { name: 'General', icon: SettingsIcon, component: SettingsGeneral },
  [SettingsPage.Library]: { name: 'Library', icon: LibraryBigIcon, component: SettingsLibrary },
  [SettingsPage.Reader]: { name: 'Reader', icon: BookOpenIcon, component: SettingsReader },
  [SettingsPage.Keybinds]: { name: 'Keybinds', icon: KeyboardIcon, component: SettingsKeybinds },
  [SettingsPage.Trackers]: {
    name: 'Trackers',
    icon: NotebookTextIcon,
    component: SettingsTrackers,
  },
  [SettingsPage.Integrations]: {
    name: 'Integrations',
    icon: ToyBrickIcon,
    component: SettingsIntegrations,
  },
};

type SettingsDialogContentProps = {
  defaultPage?: SettingsPage;
};

export function SettingsDialogContent(props: SettingsDialogContentProps) {
  const [activePage, setActivePage] = useState<SettingsPage>(
    props.defaultPage ?? SettingsPage.General,
  );

  return (
    <DialogContent className="overflow-hidden !p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] text-foreground">
      <DialogTitle className="sr-only">Settings</DialogTitle>
      <SidebarProvider className="items-start">
        <Sidebar collapsible="none">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {Object.entries(PAGES).map(([page, pageProps]) => {
                    const pageKey: SettingsPage = page as SettingsPage;
                    return (
                      <SidebarMenuItem key={PAGES[pageKey].name}>
                        <SidebarMenuButton
                          isActive={pageKey === activePage}
                          onClick={() => setActivePage(pageKey)}
                        >
                          {<pageProps.icon />}
                          <span>{pageProps.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink>Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{PAGES[activePage].name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 pt-0 space-y-2">
            {React.createElement(PAGES[activePage].component)}
          </div>
        </main>
      </SidebarProvider>
    </DialogContent>
  );
}
