'use client';
import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({ children }) {
  const [activeMain, setActiveMain] = useState("");
  const [activeSub, setActiveSub] = useState("");

  const handleItemSelect = (mainTitle, subTitle = "") => {
    setActiveMain(mainTitle);
    setActiveSub(subTitle);
  };

  return (
    <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
    <SidebarProvider>
      <SidebarInset>
        <header className="bg-background bg-opacity-90 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {/* Dynamic Breadcrumb based on selected item */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Admin Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{activeMain}</BreadcrumbPage>
              </BreadcrumbItem>
              {activeSub && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeSub}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <SidebarTrigger className="-mr-1 ml-auto rotate-180" />
          <ModeToggle />
        </header>
        {children}
      </SidebarInset>
      <AppSidebar onItemSelect={handleItemSelect} side="right" />
    </SidebarProvider>
    </ThemeProvider>
  );
}
