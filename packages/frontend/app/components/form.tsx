import FormClient from "./formClient";

export default function Form() {
  function handleSubmit(query: string) {
    if (query.length > 0) {
      window.location.href = `/search?q=${query}`;
    }
  }

  return <FormClient onSubmit={handleSubmit} />;
}
