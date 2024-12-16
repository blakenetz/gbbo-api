"use client";

import { paginationAmount } from "@/util";
import { Pagination as MantinePagination } from "@mantine/core";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface PaginationProps {
  // total number of items
  total: number;
}

function getItemProps(params: URLSearchParams, number: number) {
  const _params = new URLSearchParams(params.toString());
  _params.set("page", number.toString());
  return {
    component: Link,
    href: `/search?${_params.toString()}`,
  };
}

function getControlProps(
  params: URLSearchParams,
  totalPages: number,
  control: "next" | "previous" | "first" | "last"
) {
  const _params = new URLSearchParams(params.toString());
  const currentPage = Number(params.get("page")) || 1;
  let page = currentPage;

  if (control === "first") page = 1;
  else if (control === "last") page = totalPages;
  else if (control === "next") page = currentPage + 1;
  else if (control === "previous") page = currentPage - 1;

  _params.set("page", page.toString());

  return { component: Link, href: `/search?${_params.toString()}` };
}

export default function Pagination({ total }: PaginationProps) {
  const params = useSearchParams();

  const currentPage = Number(params.get("page")) || 1;
  const totalPages = Math.ceil(total / paginationAmount);

  return (
    <MantinePagination
      onClick={(e) => console.log("hi", e.currentTarget, e.target)}
      total={totalPages}
      value={currentPage}
      withEdges
      hideWithOnePage
      getItemProps={(page) => getItemProps(params, page)}
      getControlProps={(control) =>
        getControlProps(params, totalPages, control)
      }
    />
  );
}
