import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export function Frequency() {
    const [isRecurring, setIsRecurring] = useState(false);

    const [runAt, setRunAt] = useState<Date | undefined>(undefined);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [day, setDay] = useState("monday");

    // recurring inputs
    const [interval, setInterval] = useState("daily");
    const [dayOfWeek, setDayOfWeek] = useState("monday");
    const [time, setTime] = useState("00:00");
    // a select for the day of the week
    // a select for the time, by now i should be able to set it as
    // daily, an to chose an hour. it should be compatible with linux cron expressions
    return (
        <>
            <div className="grid grid-cols-2 items-center gap-2">
                <Label htmlFor="frequency_type" className="text-right font-bold">
                    {isRecurring ? "Repetir" : "Una vez"}
                </Label>

                <Switch
                    id="frequency_type"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                />
            </div>

            <div className="grid grid-cols-6 items-center gap-4">
                {!isRecurring && (
                    <div className="col-span-3 space-y-2">
                        <Label htmlFor="date-picker" className="">Fecha</Label>
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date-picker"
                                    className="w-32 justify-between font-normal"
                                >
                                    {runAt ? runAt.toLocaleDateString() : "Select date"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={runAt}
                                    captionLayout="dropdown"
                                    onSelect={(selectedDate) => {
                                        if (!selectedDate) {
                                            setRunAt(undefined);
                                            setPopoverOpen(false);
                                            return;
                                        }
                                        const newDate = new Date(runAt || new Date());
                                        newDate.setFullYear(selectedDate.getFullYear());
                                        newDate.setMonth(selectedDate.getMonth());
                                        newDate.setDate(selectedDate.getDate());
                                        setRunAt(newDate);
                                        setPopoverOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                )}

                {isRecurring && (
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

                {isRecurring && interval === "weekly" && (
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="day" className="text-right">
                            Dia
                        </Label>
                        <Select value={day} onValueChange={setDay}>
                            <SelectTrigger className="mb-0">
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monday">Lunes</SelectItem>
                                <SelectItem value="tuesday">Martes</SelectItem>
                                <SelectItem value="wednesday">Miercoles</SelectItem>
                                <SelectItem value="thursday">Jueves</SelectItem>
                                <SelectItem value="friday">Viernes</SelectItem>
                                <SelectItem value="saturday">Sabado</SelectItem>
                                <SelectItem value="sunday">Domingo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {isRecurring && interval === "monthly" && (
                    <div className="col-span-2 space-y-2">
                        <Label htmlFor="day" className="text-right">
                            Dia
                        </Label>
                        <Select value={day} onValueChange={setDay}>
                            <SelectTrigger className="mb-0 w-full">
                                <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="6">6</SelectItem>
                                <SelectItem value="7">7</SelectItem>
                                <SelectItem value="8">8</SelectItem>
                                <SelectItem value="9">9</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="11">11</SelectItem>
                                <SelectItem value="12">12</SelectItem>
                                <SelectItem value="13">13</SelectItem>
                                <SelectItem value="14">14</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="16">16</SelectItem>
                                <SelectItem value="17">17</SelectItem>
                                <SelectItem value="18">18</SelectItem>
                                <SelectItem value="19">19</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="21">21</SelectItem>
                                <SelectItem value="22">22</SelectItem>
                                <SelectItem value="23">23</SelectItem>
                                <SelectItem value="24">24</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="26">26</SelectItem>
                                <SelectItem value="27">27</SelectItem>
                                <SelectItem value="28">28</SelectItem>
                                <SelectItem value="L">Last day of month</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}


                <div className="col-span-2 space-y-2">
                    <Label htmlFor="time-picker" className="">
                        Hora
                    </Label>
                    <Input
                        type="time"
                        id="time-picker"
                        step="1"
                        value={runAt ? runAt.toTimeString().slice(0, 8) : ""}
                        onChange={(e) => {
                            const newDate = runAt ? new Date(runAt) : new Date();
                            const [hours, minutes, seconds] = e.target.value.split(":");
                            newDate.setHours(parseInt(hours, 10));
                            newDate.setMinutes(parseInt(minutes, 10));
                            if (seconds) {
                                newDate.setSeconds(parseInt(seconds, 10));
                            }
                            setRunAt(newDate);
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