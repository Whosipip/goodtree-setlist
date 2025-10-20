import { Home, ListMusic, Calendar, Users, FileText, BookOpen, HelpCircle, MessageSquare, Mail } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const dashboardItems = [
  { title: "Home", url: "/admin/dashboard", icon: Home },
];

const servicesItems = [
  { title: "Setlists", url: "/admin/setlists", icon: ListMusic },
  { title: "Service Management", url: "/admin/services", icon: Calendar, badge: "New" },
  { title: "Song Frequency", url: "/admin/frequency", icon: ListMusic },
  { title: "Song Library", url: "/admin/dashboard", icon: BookOpen },
  { title: "Resource Library", url: "/admin/resources", icon: FileText },
];

const teamItems = [
  { title: "Team Directory", url: "/admin/team", icon: Users },
  { title: "Song Management", url: "/admin/dashboard", icon: ListMusic },
];

const supportItems = [
  { title: "Tutorials", url: "/admin/tutorials", icon: BookOpen },
  { title: "FAQ", url: "/admin/faq", icon: HelpCircle },
  { title: "Feedback", url: "/admin/feedback", icon: MessageSquare },
  { title: "Contact", url: "/admin/contact", icon: Mail },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium hover:bg-primary/15" 
      : "hover:bg-accent";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-4">
        {/* Logo / Brand */}
        {!isCollapsed && (
          <div className="px-6 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <ListMusic className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Good Tree</h2>
                <p className="text-xs text-muted-foreground">Worship Flow</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs uppercase text-muted-foreground font-semibold">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Services Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs uppercase text-muted-foreground font-semibold">
            Services
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {servicesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          {item.badge && (
                            <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Team Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs uppercase text-muted-foreground font-semibold">
            Team
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {teamItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Support Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs uppercase text-muted-foreground font-semibold">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Status Indicator */}
        {!isCollapsed && (
          <div className="mt-auto px-6 py-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">System Online</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">v2.0.5 - 2025</p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
