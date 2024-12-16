"use client";
import { Loader, TextInput } from "@mantine/core";
import { useActionState } from "react";

interface FormClientProps {
  action: (_state: null, formData: FormData) => Promise<null>;
}

export default function FormClient({ action }: FormClientProps) {
  const [_state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <TextInput
        placeholder="Search for a recipe"
        name="q"
        disabled={isPending}
        rightSection={isPending ? <Loader size="xs" /> : null}
      />
    </form>
  );
}
