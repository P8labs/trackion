import { Anchor, Breadcrumbs } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumb() {
  const location = useLocation();

  const segments = location.pathname.split("/").filter(Boolean);

  const getLabel = (segment: string) => {
    if (segment === "projects") return "Projects";
    if (segment === "dashboard") return "Projects";

    if (segment.length > 16) {
      return "...";
    }

    return capitalizeFirstLetter(segment.substring(0, 16));
  };

  return (
    <Breadcrumbs>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        return (
          <Anchor
            component={Link}
            key={path}
            to={path}
            className="hover:no-underline! text-(--mantine-color-text)!"
          >
            {getLabel(segment).normalize()}
          </Anchor>
        );
      })}
    </Breadcrumbs>
  );
}

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
