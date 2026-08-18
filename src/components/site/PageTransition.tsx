import { Outlet } from "@tanstack/react-router";

export function PageTransition() {
  return (
    <div className="animate-page-in">
      <Outlet />
    </div>
  );
}
