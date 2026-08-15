import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/tourisme/gastronomie")({
  component: GastronomieLayout,
});

function GastronomieLayout() {
  return <Outlet />;
}
