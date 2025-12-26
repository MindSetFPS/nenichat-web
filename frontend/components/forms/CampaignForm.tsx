"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ICampaign } from "@/Nenichat/Campaigns/domain/ICampaign";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";
import { Checkbox } from "../ui/checkbox";
import { Frequency } from "./campaign-form/frequency";
import { NewCampaignData } from "@/Nenichat/Campaigns/domain/new-campaign-dto";

interface CampaignFormProps {
  onSubmit: (submitData: NewCampaignData) => Promise<void>;
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

  // task data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  // schedule data
  const [runAt, setRunAt] = useState<Date | undefined>(new Date());
  const [interval, setInterval] = useState<string | undefined>(undefined);
  const [dayOfMonth, setDayOfMonth] = useState<string | undefined>(undefined);
  const [dayOfWeek, setDayOfWeek] = useState<string | undefined>(undefined);
  const [frequency_type, setFrequencyType] = useState<'once' | 'recurring'>('once');

  // audience data
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
      audienceIds: selectedAudienceIds,
      runAt,
      interval,
      dayOfMonth,
      frequency_type,
      dayOfWeek,
    });
  };

  const handleAudienceSelection = (audienceId: number) => {
    setSelectedAudienceIds((prev) =>
      prev.includes(audienceId)
        ? prev.filter((id) => id !== audienceId)
        : [...prev, audienceId]
    );
  };

  // button disabled conditions
  // 1. at least one audience selected
  // 2. name, description, message, runAt are not empty
  // 3. if frequency_type is 'recurring', interval is not empty
  // 4/ if requency_type is recurring, and interval is weekly, dayOfWeek is not empty
  // 5. if frequency_type is recurring, and interval is monthly, dayOfMonth is not empty
  const isEditingDisabled = isLoading || initialData?.enabled === false;
  const isButtonDisabled = isEditingDisabled || selectedAudienceIds.length === 0 || !name || !description || !message || !runAt || (frequency_type === 'recurring' && (!interval || (interval === 'weekly' && !dayOfWeek) || (interval === 'monthly' && !dayOfMonth)));

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4 mb-2 pb-0">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          disabled={isEditingDisabled}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
          disabled={isEditingDisabled}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="message" className="text-right">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="col-span-3"
          disabled={isEditingDisabled}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="audiences" className="text-right">Audiences</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="col-span-3" disabled={isEditingDisabled}>
              Select Audiences ({selectedAudienceIds.length})
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              {audiences.map((audience) => (
                <div key={audience.id.toString()} className="flex items-center gap-2">
                  <Checkbox
                    id={`audience-${audience.id.toString()}`}
                    checked={selectedAudienceIds.includes(Number(audience.id))}
                    onCheckedChange={() => handleAudienceSelection(Number(audience.id))}
                    disabled={isEditingDisabled}
                  />
                  <Label htmlFor={`audience-${audience.id.toString()}`}>{audience.name}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Frequency
        time={runAt}
        setTime={setRunAt}
        interval={interval}
        setInterval={setInterval}
        dayOfMonth={dayOfMonth}
        setDayOfMonth={setDayOfMonth}
        dayOfWeek={dayOfWeek}
        setDayOfWeek={setDayOfWeek}
        frequencyType={frequency_type}
        setFrequencyType={setFrequencyType}
        disabled={isEditingDisabled}
      />

      <Button type="submit" disabled={isButtonDisabled}>
        {submitButtonText}
      </Button>
    </form>
  );
}
