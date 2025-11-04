import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/registreren/__layout')({
  component: RegisterenLayout,
})

function RegisterenLayout() {
  return <Outlet />
}
