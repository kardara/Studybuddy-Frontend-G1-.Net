import { Bell, Search, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface TopNavProps {
  userName: string;
  userRole: string;
  userAvatar?: string;
}

export function TopNav({ userName, userRole, userAvatar }: TopNavProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-end px-6">

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {showDropdown && (
            <div className="nav-dropdown">
              <button onClick={handleLogout} className="nav-dropdown-item text-destructive w-full text-left">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
