'use client';

import { BarChart3, Github, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRouteSelect } from '@/hooks/use-route-select';
import { LogoIcon } from '../ui/icons';

export function ReportSidebar() {
  const pathname = usePathname();
  const { selected } = useRouteSelect();
  const compareHref =
    selected.length >= 2
      ? `/report/compare?routes=${selected.join(',')}`
      : undefined;

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoIcon textColor="var(--foreground)" />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="group">
                  <Link
                    href="/report"
                    className={
                      pathname.startsWith('/report') ? 'text-primary' : ''
                    }
                  >
                    <Home className="size-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className={`group ${compareHref ? '' : 'cursor-not-allowed opacity-50'}`}
                >
                  {compareHref ? (
                    <Link href={compareHref}>
                      <BarChart3 className="size-4" />
                      <span>Compare</span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BarChart3 className="size-4" />
                      <span>Compare</span>
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="group">
                  <a href="https://github.com/joseph0926" target="_blank">
                    <Github className="size-4" />
                    <span>GitHub</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="mt-auto flex justify-center p-4">
        <ThemeToggle />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
