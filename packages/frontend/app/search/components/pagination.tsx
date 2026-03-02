"use client";

import { paginationAmount } from "@/util";
import {
  Pagination as MantinePagination,
  PaginationProps as MantinePaginationProps,
} from "@mantine/core";
import { useSearchParams } from "next/navigation";

export interface PaginationProps extends Partial<MantinePaginationProps> {
  total: number;
}

export default function Pagination({ total, ...props }: PaginationProps) {
  const params = useSearchParams();
  const currentPage = Number(params.get("page")) || 1;
  const totalPages = Math.ceil(total / paginationAmount);

  function createPageUrl(page: number) {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", page.toString());
    return `/search?${newParams.toString()}`;
  }

  return (
    <MantinePagination
      {...props}
      size="sm"
      total={totalPages}
      value={currentPage}
      hideWithOnePage
      getItemProps={(page) => ({
        component: "a" as any,
        href: createPageUrl(page),
      })}
      getControlProps={(control) => {
        let page = currentPage;
        let disabled = false;

        if (control === "first") {
          page = 1;
          disabled = currentPage === 1;
        } else if (control === "last") {
          page = totalPages;
          disabled = currentPage === totalPages;
        } else if (control === "next") {
          page = currentPage + 1;
          disabled = currentPage === totalPages;
        } else if (control === "previous") {
          page = currentPage - 1;
          disabled = currentPage === 1;
        }

        return {
          component: "a" as any,
          href: createPageUrl(page),
          disabled,
        };
      }}
    />
  );
}
