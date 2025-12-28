import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react";

interface SelectorProps {
    value: string;
    onValueChange: (value: string) => void;
}

export function Selector({ value, onValueChange }: SelectorProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Fecha" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Fechas</SelectLabel>
                    <SelectItem value="hoy">Hoy</SelectItem>
                    <SelectItem value="esta-semana">Esta semana</SelectItem>
                    <SelectItem value="este-mes">Este mes</SelectItem>
                    <SelectItem value="este-año">Este año</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
