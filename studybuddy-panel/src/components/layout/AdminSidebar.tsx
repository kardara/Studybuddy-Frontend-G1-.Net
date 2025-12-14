import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  Award,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  Menu,
  FolderTree,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: BookOpen, label: "Manage Courses", path: "/admin/courses" },
  { icon: FolderTree, label: "Course Content", path: "/admin/course-content" },
  { icon: ClipboardList, label: "Manage Quizzes", path: "/admin/quizzes" },
  { icon: Users, label: "Manage Students", path: "/admin/students" },
  { icon: Award, label: "Certificates", path: "/admin/certificates" },
  { icon: BarChart3, label: "Reports & Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-semibold text-sidebar-foreground">
              StudyBuddy
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <Menu className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "sidebar-item",
                isActive && "sidebar-item-active"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="sidebar-item w-full text-sidebar-muted hover:text-sidebar-foreground">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
