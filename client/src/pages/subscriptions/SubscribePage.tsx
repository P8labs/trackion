import { useState } from "react";
import {
  Container,
  Title,
  Text,
  Card,
  Badge,
  Button,
  Group,
  Stack,
  SimpleGrid,
  List,
  ThemeIcon,
  Center,
  Loader,
  Anchor,
  Code,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { CheckIcon, XIcon } from "lucide-react";
import { userHooks } from "@/hooks/queries/use-user";
import { notifications } from "@mantine/notifications";
import { useGlobalStore } from "@/store";

export function SubscribePage() {
  const navigate = useNavigate();
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const logoutMutation = userHooks.useLogout();
  const { data, isLoading: loading } = userHooks.useSubscriptionPlans();
  const { mutateAsync, isPending } = userHooks.useSubscribeToPlan();

  const handleActivate = async () => {
    if (!selectedPlanType) return;
    console.log(`Activating plan: ${selectedPlanType}`);

    try {
      await mutateAsync(selectedPlanType, {
        onError(error) {
          console.error("Subscription error:", error);
          notifications.show({
            title: "Subscription failed",
            color: "red",
            message:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred during subscription.",
          });
        },
      });

      await useGlobalStore.getState().actions.fetchCurrentUser(true);
      navigate("/projects");
    } catch (error) {
      console.error("Error activating subscription:", error);
    }
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    try {
      await logoutMutation.mutateAsync(undefined);
    } catch (error) {
      console.error("[SERVER LOGOUT FAILED]", error);
    } finally {
      useGlobalStore.getState().actions.reset();
    }
    navigate("/auth");
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Loader color="blue" size="lg" type="bars" />
      </Center>
    );
  }

  const selectedPlan = data?.plans.find((p) => p.type === selectedPlanType);

  return (
    <Container
      size="sm"
      py="sm"
      className="flex flex-col justify-center min-h-screen items-center"
    >
      <Stack align="center" mb={40}>
        <Title order={1} c="gray.2">
          Choose your plan
        </Title>
        <Text c="dimmed" size="lg" ta="center" maw={600}>
          Select the perfect plan for your application's needs. You can always
          upgrade or downgrade later.
        </Text>
      </Stack>

      <SimpleGrid
        cols={{
          base: 1,
          sm: data?.plans.length === 1 ? 1 : 2,
          md: data?.plans.length,
        }}
        spacing="lg"
        mb={50}
      >
        {data?.plans.map((plan) => {
          const isSelected = selectedPlanType === plan.type;

          return (
            <Card
              key={plan.type}
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              onClick={() => setSelectedPlanType(plan.type)}
              style={{
                cursor: "pointer",
                borderColor: isSelected ? "#339AF0" : "#373A40",
                transition: "border-color 0.2s ease",
              }}
            >
              <Group justify="space-between" mb="xs">
                <Text fw={700} size="xl" c="gray.1">
                  {plan.title}
                </Text>
                {plan.type === "pro" && (
                  <Badge variant="light" color="blue">
                    Popular
                  </Badge>
                )}
              </Group>

              <Text c="dimmed" size="sm" mb="md">
                {plan.description}
              </Text>

              <Group align="flex-end" gap="xs" mb="xl">
                <Text fz={40} fw={700} lh={1} c="gray.1">
                  {plan.price}
                </Text>
                {plan.price !== "$0" && (
                  <Text fz="sm" c="dimmed" mb={5}>
                    /month
                  </Text>
                )}
              </Group>

              <List
                spacing="sm"
                size="sm"
                center
                icon={
                  <ThemeIcon color="blue" size={20} radius="xl">
                    <CheckIcon size={14} />
                  </ThemeIcon>
                }
              >
                <List.Item>
                  <b>
                    {plan.limits.monthly_events == -1
                      ? "Unlimited"
                      : plan.limits.monthly_events.toLocaleString()}
                  </b>{" "}
                  Events/mo
                </List.Item>
                <List.Item>
                  <b>
                    {plan.limits.max_projects == -1
                      ? "Unlimited"
                      : plan.limits.max_projects}
                  </b>{" "}
                  Projects
                </List.Item>
                <List.Item>
                  <b>
                    {plan.limits.error_retention == -1
                      ? "Unlimited"
                      : plan.limits.error_retention}
                  </b>{" "}
                  Day Retention
                </List.Item>

                {plan.limits.supports_rollout ? (
                  <List.Item>Feature Rollouts</List.Item>
                ) : (
                  <List.Item
                    c="dimmed"
                    icon={
                      <ThemeIcon
                        color="gray"
                        variant="light"
                        size={20}
                        radius="xl"
                      >
                        <XIcon size={14} />
                      </ThemeIcon>
                    }
                  >
                    No Feature Rollouts
                  </List.Item>
                )}
              </List>
            </Card>
          );
        })}
      </SimpleGrid>

      <Stack align="center" mt="auto">
        <Button
          size="lg"
          w={{ base: "100%", sm: 400 }}
          onClick={handleActivate}
          disabled={!selectedPlanType || isPending}
          color="blue.7"
        >
          {selectedPlan ? `Activate ${selectedPlan.title}` : "Select a Plan"}
        </Button>

        <Text size="sm" c="dimmed">
          Logged into <Code>{useGlobalStore.getState().user?.email}</Code>.{" "}
          <Anchor
            component="button"
            disabled={isPending}
            onClick={handleLogout}
            c="#22b8cf"
            fw={500}
          >
            Logout here
          </Anchor>
        </Text>
      </Stack>
    </Container>
  );
}
