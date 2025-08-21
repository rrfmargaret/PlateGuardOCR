import { useLocation } from "wouter";
import { Camera, List, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Camera, label: "Capture" },
  { path: "/records", icon: List, label: "Records" },
  { path: "/stats", icon: BarChart3, label: "Stats" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 px-4 py-2 z-40 md:hidden">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center py-2 px-3 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-text-secondary hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
