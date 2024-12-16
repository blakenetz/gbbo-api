import { redirect } from "next/navigation";
import FormClient from "./formClient";

export default function Form() {
  async function handleSubmit(_state: null, formData: FormData) {
    "use server";
    const query = formData.get("q") as string;
    if (query.length > 0) {
      redirect(`/search?q=${query}`);
    }
    return null;
  }

  return <FormClient action={handleSubmit} />;
}
