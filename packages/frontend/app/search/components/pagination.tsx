"use client";

import { paginationAmount } from "@/util";
import {
  Pagination as MantinePagination,
  PaginationProps as MantinePaginationProps,
} from "@mantine/core";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface PaginationProps extends Partial<MantinePaginationProps> {
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
  let hidden = false;

  if (control === "first") {
    page = 1;
    hidden = currentPage === 1;
  } else if (control === "last") {
    page = totalPages;
    hidden = currentPage === totalPages;
  } else if (control === "next") {
    page = currentPage + 1;
    hidden = currentPage === totalPages;
  } else if (control === "previous") {
    page = currentPage - 1;
    hidden = currentPage === 1;
  }

  _params.set("page", page.toString());

  return {
    component: Link,
    href: `/search?${_params.toString()}`,
    disabled: page === currentPage,
    ...(hidden && { style: { display: "none" } }),
  };
}

export default function Pagination({ total, ...props }: PaginationProps) {
  const params = useSearchParams();

  const currentPage = Number(params.get("page")) || 1;
  const totalPages = Math.ceil(total / paginationAmount);

  return (
    <MantinePagination
      {...props}
      size="sm"
      total={totalPages}
      value={currentPage}
      hideWithOnePage
      getItemProps={(page) => getItemProps(params, page)}
      getControlProps={(control) =>
        getControlProps(params, totalPages, control)
      }
    />
  );
}
