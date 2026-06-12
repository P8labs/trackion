import { Divider, Grid, Paper } from "@mantine/core";
import { useParams } from "react-router-dom";
import { AnalyticsBreakdown } from "@/components/core/project/analytics/analytics-breakdown";
import { TopCountries } from "@/components/core/project/analytics/top-country-traffic";
import { TopPages } from "@/components/core/project/analytics/top-pages-traffic";

export function BreakdownPage() {
  const { id: projectId = "" } = useParams<{ id: string }>();

  return (
    <Paper>
      <AnalyticsBreakdown projectId={projectId} />

      <Divider />

      <Grid>
        <Grid.Col
          span={{
            base: 12,
            lg: 6,
          }}
        >
          <TopCountries projectId={projectId} />
        </Grid.Col>

        <Grid.Col
          span={{
            base: 12,
            lg: 6,
          }}
        >
          <TopPages projectId={projectId} />
        </Grid.Col>
      </Grid>
    </Paper>
  );
}
