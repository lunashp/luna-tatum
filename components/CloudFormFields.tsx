"use client";
import React, { useMemo, useState } from "react";
import { Input, Label } from "@/components/ui";
import Toggle from "@/components/Toggle";
import MultiSelect from "@/components/MultiSelect";
import { AWSRegionList, CLOUD_GROUP_NAMES, Cloud, Provider } from "@/types";

/**
 * CloudFormFields
 * - 단일 책임: Cloud 엔티티의 폼 필드 UI와 변경 이벤트 처리 (상태 보유 X)
 */
export function CloudFormFields({
  form,
  errors,
  onChange,
}: {
  form: Partial<Cloud>;
  onChange: <K extends keyof Cloud>(key: K, value: Cloud[K]) => void;
  errors?: Record<string, string>;
}) {
  const providerOptions: Provider[] = ["AWS", "AZURE", "GCP"];
  const credentialTypeOptions: Array<{
    label: string;
    value: any;
    disabled?: boolean;
  }> = [
    { label: "Access Key", value: "ACCESS_KEY" },
    { label: "Assume Role", value: "ASSUME_ROLE", disabled: true },
    { label: "Roles Anywhere", value: "ROLES_ANYWHERE", disabled: true },
  ];

  // Secret key visibility toggle (local UI state)
  const [showSecret, setShowSecret] = useState(false);
  const freq = (form.scheduleScanSetting as any)?.frequency ?? "DAY";
  const scheduleDisabled = useMemo(() => {
    return {
      date: !(freq === "MONTH"),
      weekday: !(freq === "WEEK"),
      hour: freq === "HOUR",
      minute: false,
    };
  }, [freq]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="space-y-4 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Provider</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={(form.provider as Provider) ?? "AWS"}
              onChange={(e) => onChange("provider", e.target.value as Provider)}
            >
              {providerOptions.map((p) => (
                <option key={p} value={p} disabled={p !== "AWS"}>
                  {p} {p !== "AWS" ? "(Disabled)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>
              Cloud Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cloud-name"
              placeholder="Please enter the cloud name."
              aria-invalid={Boolean(errors?.name) || undefined}
              value={form.name ?? ""}
              onChange={(e) => onChange("name", e.target.value as any)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Human readable name to identify this cloud.
            </p>
            {errors?.name ? (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Select Key Registration Method</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
              value={(form.credentialType as any) ?? "ACCESS_KEY"}
              onChange={(e) =>
                onChange("credentialType", e.target.value as any)
              }
            >
              {credentialTypeOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={Boolean(opt.disabled)}
                >
                  {opt.label}
                  {opt.disabled ? " (Disabled)" : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Proxy URL</Label>
            <Input
              placeholder="https://proxy.example.com"
              value={(form.proxyUrl as string) ?? ""}
              onChange={(e) => onChange("proxyUrl", e.target.value as any)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Configure only if outbound traffic must go through a
              proxy.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>
              Cloud Group <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              id="cloud-group-name"
              options={Array.from(CLOUD_GROUP_NAMES)}
              values={(form.cloudGroupName as string[]) ?? []}
              onChange={(vals) => onChange("cloudGroupName", vals as any)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Select one or more groups to organize this cloud.
            </p>
            {errors?.cloudGroupName ? (
              <p className="mt-1 text-xs text-red-600">
                {errors.cloudGroupName}
              </p>
            ) : null}
          </div>
          <div>
            <Label>
              Regions (must include 'global'){" "}
              <span className="text-red-500">*</span>
            </Label>
            <MultiSelect
              id="region-list"
              options={Array.from(AWSRegionList)}
              values={(form.regionList as string[]) ?? []}
              onChange={(vals) => onChange("regionList", vals as any)}
              ensureIncludes="global"
            />
            <p className="mt-1 text-xs text-gray-500">
              Select one or more regions. Global is required for control-plane
              events.
            </p>
            {errors?.regionList ? (
              <p className="mt-1 text-xs text-red-600">{errors.regionList}</p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Event Process</Label>
            <Toggle
              checked={!!form.eventProcessEnabled}
              onChange={(v) => onChange("eventProcessEnabled", v as any)}
            />
          </div>
          <div>
            <Label>User Activity</Label>
            <Toggle
              checked={!!form.userActivityEnabled}
              onChange={(v) => onChange("userActivityEnabled", v as any)}
            />
          </div>
          <div>
            <Label>Schedule Scan</Label>
            <Toggle
              checked={!!form.scheduleScanEnabled}
              onChange={(v) => onChange("scheduleScanEnabled", v as any)}
            />
          </div>
        </div>

        {/* Schedule Scan Settings */}
        {form.scheduleScanEnabled ? (
          <fieldset className="rounded-lg border p-4">
            <legend className="px-1 text-sm font-semibold">
              Set Scan Frequency
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Frequency</Label>
                <select
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                  value={(form.scheduleScanSetting as any)?.frequency ?? "DAY"}
                  onChange={(e) =>
                    onChange("scheduleScanSetting", {
                      ...(form.scheduleScanSetting as any),
                      frequency: e.target.value,
                    } as any)
                  }
                >
                  <option value="HOUR">Hourly</option>
                  <option value="DAY">Daily</option>
                  <option value="WEEK">Weekly</option>
                  <option value="MONTH">Monthly</option>
                </select>
              </div>
              <div>
                <Label>Minute</Label>
                <Input
                  id="schedule-minute"
                  value={(form.scheduleScanSetting as any)?.minute ?? "0"}
                  onChange={(e) =>
                    onChange("scheduleScanSetting", {
                      ...(form.scheduleScanSetting as any),
                      minute: e.target.value,
                    } as any)
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Hour</Label>
                <Input
                  id="schedule-hour"
                  disabled={scheduleDisabled.hour}
                  aria-invalid={Boolean(errors?.["schedule.hour"]) || undefined}
                  value={(form.scheduleScanSetting as any)?.hour ?? "0"}
                  onChange={(e) =>
                    onChange("scheduleScanSetting", {
                      ...(form.scheduleScanSetting as any),
                      hour: e.target.value,
                    } as any)
                  }
                />
                {errors?.["schedule.hour"] ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors["schedule.hour"]}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Day of Week</Label>
                <select
                  id="schedule-weekday"
                  className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                  disabled={scheduleDisabled.weekday}
                  value={(form.scheduleScanSetting as any)?.weekday ?? "MON"}
                  onChange={(e) =>
                    onChange("scheduleScanSetting", {
                      ...(form.scheduleScanSetting as any),
                      weekday: e.target.value,
                    } as any)
                  }
                >
                  <option value="MON">Mon</option>
                  <option value="TUE">Tue</option>
                  <option value="WED">Wed</option>
                  <option value="THU">Thu</option>
                  <option value="FRI">Fri</option>
                  <option value="SAT">Sat</option>
                  <option value="SUN">Sun</option>
                </select>
                {errors?.["schedule.weekday"] ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors["schedule.weekday"]}
                  </p>
                ) : null}
              </div>
              <div>
                <Label>Date (1~28)</Label>
                <Input
                  id="schedule-date"
                  disabled={scheduleDisabled.date}
                  aria-invalid={Boolean(errors?.["schedule.date"]) || undefined}
                  value={(form.scheduleScanSetting as any)?.date ?? "1"}
                  onChange={(e) =>
                    onChange("scheduleScanSetting", {
                      ...(form.scheduleScanSetting as any),
                      date: e.target.value,
                    } as any)
                  }
                />
                {errors?.["schedule.date"] ? (
                  <p className="mt-1 text-xs text-red-600">
                    {errors["schedule.date"]}
                  </p>
                ) : null}
              </div>
            </div>
          </fieldset>
        ) : null}

        <fieldset className="rounded-lg border p-4">
          <legend className="px-1 text-sm font-semibold">
            AWS Credentials
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                Access Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access-key-id"
                value={(form.credentials as any)?.accessKeyId ?? ""}
                aria-invalid={
                  Boolean(errors?.["credentials.accessKeyId"]) || undefined
                }
                onChange={(e) =>
                  onChange("credentials", {
                    ...(form.credentials as any),
                    accessKeyId: e.target.value,
                  } as any)
                }
              />
              {errors?.["credentials.accessKeyId"] ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors["credentials.accessKeyId"]}
                </p>
              ) : null}
            </div>
            <div>
              <Label>
                Secret Key <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="secret-access-key"
                  type={showSecret ? "text" : "password"}
                  value={(form.credentials as any)?.secretAccessKey ?? ""}
                  aria-invalid={
                    Boolean(errors?.["credentials.secretAccessKey"]) ||
                    undefined
                  }
                  onChange={(e) =>
                    onChange("credentials", {
                      ...(form.credentials as any),
                      secretAccessKey: e.target.value,
                    } as any)
                  }
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                  onClick={() => setShowSecret((v) => !v)}
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? "Hide" : "Show"}
                </button>
              </div>
              {errors?.["credentials.secretAccessKey"] ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors["credentials.secretAccessKey"]}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-lg border p-4">
          <legend className="px-1 text-sm font-semibold">
            AWS Event Source
          </legend>
          <div>
            <Label>
              CloudTrail Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cloudtrail-name"
              placeholder="Please enter the cloud trail name."
              aria-invalid={
                Boolean(errors?.["eventSource.cloudTrailName"]) || undefined
              }
              value={(form.eventSource as any)?.cloudTrailName ?? ""}
              onChange={(e) =>
                onChange("eventSource", {
                  cloudTrailName: e.target.value,
                } as any)
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Name of the CloudTrail to ingest events from.
            </p>
            {errors?.["eventSource.cloudTrailName"] ? (
              <p className="mt-1 text-xs text-red-600">
                {errors["eventSource.cloudTrailName"]}
              </p>
            ) : null}
          </div>
        </fieldset>
      </div>
    </div>
  );
}

export default CloudFormFields;
