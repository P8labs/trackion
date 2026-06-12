import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactElement, ReactNode } from "react";

type RenderWithProvidersOptions = RenderOptions & {
  route?: string;
};

function TestProviders({
  children,
  route = "/",
}: {
  children: ReactNode;
  route?: string;
}) {
  return (
    <MantineProvider defaultColorScheme="dark">
      <ModalsProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...options }: RenderWithProvidersOptions = {},
) {
  window.history.pushState({}, "", route);

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders route={route}>{children}</TestProviders>
    ),
    ...options,
  });
}
