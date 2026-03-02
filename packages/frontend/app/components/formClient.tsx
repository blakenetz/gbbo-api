"use client";
import { Loader, TextInput } from "@mantine/core";
import { useState } from "react";

interface FormClientProps {
  onSubmit: (query: string) => void;
}

export default function FormClient({ onSubmit }: FormClientProps) {
  const [isPending, setIsPending] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get("q") as string;

    setIsPending(true);
    onSubmit(query);
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextInput
        placeholder="Search for a recipe"
        name="q"
        disabled={isPending}
        rightSection={isPending ? <Loader size="xs" /> : null}
      />
    </form>
  );
}
