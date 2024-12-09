import { Flex, Text, TextInput, Title } from "@mantine/core";
import styles from "./page.module.css";
import { redirect } from "next/navigation";

export default async function Home() {
  async function handleSubmit(formData: FormData) {
    "use server";
    const query = formData.get("q") as string;
    if (query.length > 0) {
      redirect(`/search?q=${query}`);
    }
  }

  return (
    <Flex
      className={styles.root}
      component="section"
      justify="center"
      align="flex-start"
    >
      <Flex
        className={styles.container}
        direction="column"
        gap="md"
        align="center"
        justify="center"
      >
        <Title>GBBO Search</Title>
        <Text>A new way to search for Great British Bake Off recipes</Text>
        <form action={handleSubmit}>
          <TextInput placeholder="Search for a recipe" name="q" />
        </form>
      </Flex>
    </Flex>
  );
}
