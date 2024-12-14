"use server";
import { Diet, Baker } from "@/types";
import { API_URL } from "@/util";
import { redirect } from "next/navigation";

export async function fetchFilters(): Promise<{
  bakers: Baker[];
  diets: Diet[];
}> {
  const responses = await Promise.all([
    fetch(`${API_URL}/baker`),
    fetch(`${API_URL}/diet`),
  ]);
  const [bakers, diets] = await Promise.all(
    responses.map((response) => response.json())
  );

  return { bakers, diets };
}

export async function submitFilters(formData: FormData) {
  const q = formData.get("q") as string;
  const is_technical = formData.get("is_technical") as string;
  const difficulty = formData.get("difficulty") as string;
  const time = formData.get("time") as string;
  const bakers = formData.get("bakers") as string;
  const diets = formData.getAll("diets") as string[];

  const searchParams = new URLSearchParams();

  if (q) searchParams.append("q", q);
  if (is_technical) searchParams.append("is_technical", is_technical);
  if (difficulty) searchParams.append("difficulty", difficulty);
  if (time && time !== "0") searchParams.append("time", time);
  if (bakers) searchParams.append("baker_ids", bakers);
  if (diets.length > 0) searchParams.append("diet_ids", diets.join(","));

  if (searchParams.size > 0) {
    redirect(`/search?${searchParams.toString()}`);
  }
}
