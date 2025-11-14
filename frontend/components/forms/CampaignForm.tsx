"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ICampaign } from "@/dto/ICampaign";
import { IAudience } from "@/dto/IAudience";
import { Checkbox } from "../ui/checkbox";

interface CampaignFormProps {
  onSubmit: (data: {
    name: string;
    description: string;
    message: string;
    run_at?: Date;
    audienceIds?: number[];
  }) => Promise<void>;
  initialData?: Partial<ICampaign>;
  isLoading: boolean;
  submitButtonText: string;
}

export function CampaignForm({
  onSubmit,
  initialData,
  isLoading,
  submitButtonText,
}: CampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [runAt, setRunAt] = useState<Date | undefined>(new Date());
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [audiences, setAudiences] = useState<IAudience[]>([]);
  const [selectedAudienceIds, setSelectedAudienceIds] = useState<number[]>([]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
      setMessage(initialData.message || "");
      setRunAt(initialData.run_at ? new Date(initialData.run_at) : new Date());
      setSelectedAudienceIds(initialData.audienceIds || []);
    } else {
      setName("");
      setDescription("");
      setMessage("");
      setRunAt(new Date());
      setSelectedAudienceIds([]);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchAudiences = async () => {
      const response = await fetch("/api/audiences");
      const data = await response.json();
      setAudiences(data);
    };
    fetchAudiences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      description,
      message,
      run_at: runAt,
      audienceIds: selectedAudienceIds,
    });
  };

  const handleAudienceSelection = (audienceId: number) => {
    setSelectedAudienceIds((prev) =>
      prev.includes(audienceId)
        ? prev.filter((id) => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="message" className="text-right">
          Message
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="col-span-3"
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="audiences" className="text-right">
          Audiences
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="col-span-3">
              Select Audiences ({selectedAudienceIds.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              {audiences.map((audience) => (
                <div key={audience.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`audience-${audience.id}`}
                    checked={selectedAudienceIds.includes(audience.id)}
                    onCheckedChange={() => handleAudienceSelection(audience.id)}
                  />
                  <Label htmlFor={`audience-${audience.id}`}>
                    {audience.name}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <Label htmlFor="run_at" className="text-right font-bold">
        Run At (HH:MM)
      </Label>
      <div className="grid grid-cols-2 items-center gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="">
            Date
          </Label>
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

        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker" className="">
            Time
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
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </div>
      </div>
      <Button type="submit" disabled={isLoading}>
        {submitButtonText}
      </Button>
    </form>
  );
}
