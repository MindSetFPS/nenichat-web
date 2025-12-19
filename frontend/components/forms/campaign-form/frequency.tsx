import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export function Frequency({
    time,
    setTime,
    interval,
    setInterval,
    dayOfMonth,
    setDayOfMonth,
    dayOfWeek,
    setDayOfWeek,
    frequencyType,
    setFrequencyType,
}: {
    time: Date | undefined;
    setTime: (time: Date | undefined) => void;
    interval: string;
    setInterval: (interval: string) => void;
    frequencyType: 'once' | 'recurring';
    setFrequencyType: (frequencyType: 'once' | 'recurring') => void;
    dayOfMonth: string | undefined;
    setDayOfMonth: (dayOfMonth: string | undefined) => void;
    dayOfWeek: string;
    setDayOfWeek: (dayOfWeek: string) => void;
}) {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const weekDays = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    return (
        <>
            <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="frequency_type" className="text-right font-bold">
                    {frequencyType === 'recurring' ? "Repetir" : "Una vez"}
                </Label>
                <Switch
                    id="frequency_type"
                    checked={frequencyType === 'recurring'}
                    onCheckedChange={(checked) => setFrequencyType(checked ? 'recurring' : 'once')}
                />
            </div>

            <div className="grid grid-cols-6 items-center gap-4">
                {frequencyType === 'once' && (
                    <div className="col-span-3 space-y-2">
                        <Label htmlFor="date-picker" className="">Fecha</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date-picker"
                                    className="w-32 justify-between font-normal"
                                >
                                    {time ? time.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={time}
                                    captionLayout="dropdown"
                                    onSelect={(selectedDate) => {
                                        if (!selectedDate) {
                                            setTime(undefined);
                                            setPopoverOpen(false);
                                            return;
                                        }
                                        const newDate = new Date(time || new Date());
                                        newDate.setFullYear(selectedDate.getFullYear());
                                        newDate.setMonth(selectedDate.getMonth());
                                        newDate.setDate(selectedDate.getDate());
                                        setTime(newDate);
                                        setPopoverOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {frequencyType === 'recurring' && (
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="interval" className="">
                            Intervalo
                        </Label>
                        <Select value={interval} onValueChange={setInterval}>
                            <SelectTrigger className="mb-0">
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">A diario</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Cada mes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {frequencyType === 'recurring' && interval === "weekly" && (
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="day" className="text-right">
                            Dia
                        </Label>
                        <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                            <SelectTrigger className="mb-0">
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                {weekDays.map((day, index) => {
                                    // Create a date object for the weekday (using a reference Sunday + day index)
                                    const date = new Date(2024, 0, 1 + index); // Jan 1, 2024 is a Monday
                                    return (
                                        <SelectItem key={day} value={day}>
                                            {date.toLocaleDateString("es-ES", { weekday: "long" })}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {frequencyType === 'recurring' && interval === "monthly" && (
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="day" className="text-right">
                            Dia
                        </Label>
                        <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                            <SelectTrigger className="mb-0 w-full">
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                                    <SelectItem key={day} value={day.toString()}>
                                        {day}
                                    </SelectItem>
                                ))}
                                <SelectItem value="L">Last day of month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="col-span-2 space-y-2">
                    <Label htmlFor="time-picker" className="">Hora</Label>
                    <Input
                        type="time"
                        id="time-picker"
                        step="1"
                        value={time ? time.toTimeString().slice(0, 8) : ""}
                        onChange={(e) => {
                            const newDate = time ? new Date(time) : new Date();
                            const [hours, minutes, seconds] = e.target.value.split(":");
                            newDate.setHours(parseInt(hours, 10));
                            newDate.setMinutes(parseInt(minutes, 10));
                            if (seconds) {
                                newDate.setSeconds(parseInt(seconds, 10));
                            }
                            setTime(newDate);
                        }}
                        className="bg-background 
                        appearance-none [&::-webkit-calendar-picker-indicator]:hidden 
                        [&::-webkit-calendar-picker-indicator]:appearance-none"
                    />
                </div>
            </div>
        </>
    )
}