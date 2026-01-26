import { Button } from "./button";

type PaginationComponentProps = {
    pageSize: number,
    page: number,
    setPage: (page: number) => any,
    setPageSize?: (size: number) => any | undefined,
    totalPages: number
}

export function Pagination({ page, pageSize, setPage, setPageSize, totalPages }: PaginationComponentProps) {

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (setPageSize) {
            setPageSize(Number(e.target.value));
            setPage(1); // Reset to first page when page size changes
        }
    };

    return (
        <div className="md:flex justify-between items-center space-x-2">
            {setPageSize && (
                <div className="w-full">
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>

                </div>
            )}

            <div className="flex items-center justify-between space-x-2 w-full mt-2 md:mt-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    Previous
                </Button>
                <span className="text-sm">
                    Page {page} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                >
                    Next
                </Button>
            </div>

        </div>
    )
}