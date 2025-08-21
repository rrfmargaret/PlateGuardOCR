import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Records from "@/pages/records";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import BottomNavigation from "@/components/bottom-navigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/records" component={Records} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background-page">
          <Router />
          <BottomNavigation />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
