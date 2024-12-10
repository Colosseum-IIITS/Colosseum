'use client'
import * as React from "react";
import { useRouter } from "next/navigation"; // Import Next.js router
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Sample data for the navigation menu
const data = {
  navMain: [
    {
      title: "User Management",
      url: "user-management",
      items: [
        { title: "Manage Organisers", url: "manage-organisers" },
        { title: "Manage Players", url: "manage-players" },
        { title: "Ban History", url: "ban-history" },
      ],
    },
    {
      title: "Tournament Management",
      url: "tournament-management",
      items: [
        { title: "Pending Tournaments", url: "pending-tournaments" },
        { title: "Active and Completed Tournaments", url: "active-completed-tournaments" },
      ],
    },
    {
      title: "Reports Management",
      url: "reports-management",
      items: [
        { title: "Reported Teams/Organisers", url: "reported-teams-organisers" },
        { title: "Reports Analytics", url: "reports-analytics" },
      ],
    },
    {
      title: "Platform Metrics",
      url: "platform-metrics",
      items: [
        { title: "User Activity", url: "user-activity" },
        { title: "Growth Analytics", url: "growth-analytics" },
      ],
    },
  ],
};

export function AppSidebar({ onItemSelect, ...props }) {
  const router = useRouter(); // Initialize the router

  // Function to handle navigation
  const handleMenuItemClick = (mainTitle, subTitle = null, url) => {
    // Navigate to the appropriate URL (main or sub menu)
    router.push(`/admin/${url}`);
    onItemSelect(mainTitle, subTitle); // Update breadcrumb with the selected item
  };

  return (
    <Sidebar {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href="#"
                      className="font-medium"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior
                        handleMenuItemClick(item.title, null, item.url);
                      }}
                    >
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default link behavior
                                handleMenuItemClick(item.title, subItem.title, item.url);
                              }}
                            >
                              {subItem.title}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
