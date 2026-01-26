import { FilterFn } from "@tanstack/react-table";

/**
 * a function that can filter rows by today, this week, this month or this year. it returns true if the row matches the filter value.
 * @param row 
 * @param columnId 
 * @param value 
 * @returns 
 */
export const dateIntervalFilter: FilterFn<any> = (row, columnId, value) => {
    const rowValue = row.getValue(columnId) as string;
    if (!value || !rowValue) return true;

    const rowDate = new Date(rowValue);
    const now = new Date();

    switch (value) {
        case "today":
            return rowDate.toDateString() === now.toDateString();
        case "this-week": {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            return rowDate >= startOfWeek && rowDate <= endOfWeek;
        }
        case "this-month":
            return (
                rowDate.getMonth() === now.getMonth() &&
                rowDate.getFullYear() === now.getFullYear()
            );
        case "this-year":
            return rowDate.getFullYear() === now.getFullYear();
        default:
            return rowDate.toDateString() === new Date(value as string).toDateString();
    }
};