"use client"

import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    Row,
    RowSelectionState,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { DayIntervalSelector } from "./day-inverval-selector";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    filterMode?: "column" | "global",
    showSearchInput?: boolean,
    searchInputColumnId?: string,
    showColumnsVisibilityDropdown?: boolean,
    visibleColumns?: VisibilityState,
    rowSelection?: RowSelectionState,
    showSelectColumn?: boolean,
    showDateSelector?: boolean,
    dateFilterColumnId?: string,
    selectedDateDefault?: "today" | "this-week" | "this-month" | "this-year" | "all-time" | null,
    getRowId?: (row: TData) => string,
    onRowSelectionChange?: (selection: RowSelectionState) => void,
    onRowClick?: (row: TData) => void,
}

export function DataTable<TData, TValue>({
    columns,
    data,
    filterMode = "column",
    visibleColumns,
    showSearchInput = true,
    searchInputColumnId = "id",
    showColumnsVisibilityDropdown = true,
    rowSelection: externalRowSelection,
    showSelectColumn: showSelectColumn,
    showDateSelector: showDateSelector,
    dateFilterColumnId = "created_at",
    selectedDateDefault = "today",
    getRowId: getRowId,
    onRowSelectionChange: setExternalRowSelection,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(visibleColumns ?? {});
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10
    })
    const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
    const [selectedDate, setSelectedDate] = useState<string>(selectedDateDefault ?? "today")

    const isMobile = useIsMobile()

    const rowSelection = externalRowSelection ?? internalRowSelection;
    const onRowSelectionChange = (updaterOrValue: any) => {
        const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
        if (setExternalRowSelection) {
            setExternalRowSelection(newValue);
        } else {
            setInternalRowSelection(newValue);
        }
    };

    useEffect(() => {
        setPagination({
            pageIndex: 0,
            pageSize: isMobile ? 10 : 50
        })
    }, [isMobile])

    const table = useReactTable({
        data,
        columns,
        enableColumnFilters: filterMode === "column",
        enableGlobalFilter: filterMode === "global",
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();

            // Get all cell values from the row
            const cellValues = row.getAllCells().map(cell => {
                const value = cell.getValue();

                // Handle null/undefined
                if (value === null || value === undefined) return '';

                // Handle bigint
                if (typeof value === 'bigint') return value.toString();

                // Handle other types
                return String(value);
            });

            // Check if any cell value includes the search term
            return cellValues.some(cellValue => cellValue.toLowerCase().includes(search));
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: getRowId,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: onRowSelectionChange,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            pagination,
            rowSelection,
        },
    })

    useEffect(() => {
        table.getColumn("select")?.toggleVisibility(showSelectColumn);
    }, [showSelectColumn])

    useEffect(() => {
        table.getColumn(dateFilterColumnId)?.setFilterValue(selectedDate)
    }, [selectedDate])

    return (
        <>
            <div className={`flex items-center mb-0 ${showSearchInput || showColumnsVisibilityDropdown ? "py-2" : ""} space-x-2`}>
                {showDateSelector &&
                    <DayIntervalSelector
                        selectedInterval={selectedDate}
                        onIntervalChange={setSelectedDate}
                    />
                }
                {showSearchInput &&
                    <Input
                        placeholder="Filtrar"
                        value={
                            filterMode === "global"
                                ? (globalFilter ?? "")
                                : (table.getColumn(searchInputColumnId)?.getFilterValue() as string) ?? ""
                        }
                        onChange={(event) => {
                            if (filterMode === "global") {
                                setGlobalFilter(event.target.value);
                            } else {
                                table.getColumn(searchInputColumnId)?.setFilterValue(event.target.value);
                            }
                        }}
                        className="max-w-sm"
                    />
                }
                {showColumnsVisibilityDropdown &&
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columnas
                                <ArrowUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) => column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(value as boolean)}
                                        >
                                            {(column.id).replace("_", " ").charAt(0).toUpperCase() + (column.id).replace("_", " ").slice(1)}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
                }
            </div>
            <Table className="mb-0">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="sticky top-0 z-10 bg-background text-left w-min">
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {
                        table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow 
                                    key={row.id} 
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row.original)}
                                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                                >
                                    {
                                        row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))
                                    }
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )
                    }
                </TableBody>
            </Table>
            <div className="flex items-center justify-center md:justify-end space-x-2 pt-2 sticky bottom-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <span className="flex items-center gap-1">
                    <div>Pagina{' '}
                        {table.getState().pagination.pageIndex + 1} de {' '}
                        {table.getPageCount().toLocaleString()}
                    </div>
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </>
    )
}