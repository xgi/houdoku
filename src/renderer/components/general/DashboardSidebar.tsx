import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/ui/components/Sidebar';
import { useNavigate } from 'react-router-dom';
import routes from '@/common/constants/routes.json';
import {
  Blocks,
  ChevronRight,
  FolderDown,
  GitFork,
  Home,
  Info,
  LibraryBig,
  Settings,
  SquarePlus,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/components/Collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/components/Dialog';
import { Button } from '@/ui/components/Button';
import packageJson from '../../../../package.json';
import { SettingsDialogContent } from '../settings/SettingsDialogContent';

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  // const handleUpdateCheck = () => {
  //   setCheckingForUpdate(true);
  //   ipcRenderer
  //     .invoke(ipcChannels.APP.CHECK_FOR_UPDATES)
  //     .finally(() => setCheckingForUpdate(false))
  //     .catch(console.error);
  // };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-4" />
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
          <SidebarMenu>
            <Collapsible asChild defaultOpen={true} className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton>
                    <LibraryBig />
                    <span>Library</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {['first', 'second', 'third'].map((item) => (
                      <SidebarMenuSubItem key={item}>
                        <SidebarMenuSubButton
                          className="cursor-pointer"
                          onClick={() => navigate(routes.LIBRARY)}
                        >
                          <span>{item}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.SEARCH)}>
                <SquarePlus />
                <span>Add Series</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.PLUGINS)}>
                <Blocks />
                <span>Plugins</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => navigate(routes.DOWNLOADS)}>
                <FolderDown />
                <span>Downloads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog defaultOpen>
                <DialogTrigger asChild>
                  <SidebarMenuButton>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <SettingsDialogContent />
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Dialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <span className="truncate font-semibold text-sm">
                      Houdoku v{packageJson.version}
                    </span>
                    <Info className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width]  rounded-lg"
                  side="right"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Check for updates</DropdownMenuItem>
                    <DialogTrigger asChild>
                      <DropdownMenuItem>About Houdoku</DropdownMenuItem>
                    </DialogTrigger>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About Houdoku</DialogTitle>
                  <DialogDescription>v{packageJson.version}</DialogDescription>
                </DialogHeader>
                <div>
                  <p>
                    Houdoku is a desktop manga reader. To add a series to your library, click the{' '}
                    <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                      Add Series
                    </code>{' '}
                    tab on the left panel and search for the series from a supported content source.
                    To add more content sources, install a{' '}
                    <code className="relative bg-muted px-[0.3rem] py-[0.2rem] text-sm font-semibold">
                      Plugin
                    </code>
                    .
                  </p>
                </div>
                <DialogFooter>
                  <Button variant={'secondary'} asChild>
                    <a href={packageJson.repository.url} target="_blank">
                      <GitFork />
                      Repository
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={packageJson.homepage} target="_blank">
                      <Home />
                      Official Website
                    </a>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
