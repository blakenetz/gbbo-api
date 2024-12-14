"use client";

import { paginationAmount } from "@/util";
import { Pagination as MantinePagination } from "@mantine/core";

interface PaginationProps {
  // total number of items
  total: number;
}

export default function Pagination({ total }: PaginationProps) {
  const totalPages = Math.ceil(total / paginationAmount);

  return <MantinePagination total={totalPages} />;
}
