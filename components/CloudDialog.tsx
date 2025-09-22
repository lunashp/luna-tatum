"use client";
import { useEffect, useState } from "react";
import { Button, Dialog, DialogFooter, DialogHeader } from "@/components/ui";
import { Cloud } from "@/types";
import { fetchCloudById } from "@/lib/mockApi";
import CloudFormFields from "@/components/CloudFormFields";

/**
 * CloudDialog
 * - 단일 책임: 다이얼로그 열림 제어, 데이터 로딩/초기화, 제출 트리거 역할만 수행
 * - 폼 UI와 입력값 변경은 `CloudFormFields`로 분리
 */

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cloudId: string | null;
  initialData?: Cloud;
  onSubmitted: (payload: Partial<Cloud> & { id?: string }) => void;
};

export default function CloudDialog({
  open,
  onOpenChange,
  cloudId,
  initialData,
  onSubmitted,
}: Props) {
  const isEdit = Boolean(cloudId);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // 폼 데이터 상태: 다이얼로그에서만 보유하고, UI는 CloudFormFields로 위임
  const [form, setForm] = useState<Partial<Cloud>>({
    provider: "AWS",
    name: "",
    cloudGroupName: [],
    eventProcessEnabled: true,
    userActivityEnabled: false,
    scheduleScanEnabled: false,
    scheduleScanSetting: { frequency: "DAY", hour: "0", minute: "0" },
    regionList: ["global"],
    credentials: { accessKeyId: "", secretAccessKey: "" },
    credentialType: "ACCESS_KEY",
    eventSource: { cloudTrailName: "" },
    proxyUrl: "",
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit && cloudId) {
      setLoading(true);
      // 상세 조회를 비동기로 로드 (모킹 API)
      fetchCloudById(cloudId)
        .then((data) => {
          if (data) {
            setForm({ ...data });
          }
        })
        .finally(() => setLoading(false));
    } else {
      // 생성 모드: 초기값 리셋
      setForm({
        provider: "AWS",
        name: "",
        cloudGroupName: [],
        eventProcessEnabled: true,
        userActivityEnabled: false,
        scheduleScanEnabled: false,
        scheduleScanSetting: { frequency: "DAY", hour: "0", minute: "0" },
        regionList: ["global"],
        credentials: { accessKeyId: "", secretAccessKey: "" },
        credentialType: "ACCESS_KEY",
        eventSource: { cloudTrailName: "" },
        proxyUrl: "",
      });
    }
  }, [open, isEdit, cloudId]);

  function update<K extends keyof Cloud>(key: K, value: Cloud[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(values: Partial<Cloud>): Record<string, string> {
    const e: Record<string, string> = {};
    // required: name
    if (!values.name || !String(values.name).trim())
      e["name"] = "Name is required";
    // cloudGroupName: at least 1
    const groups = values.cloudGroupName ?? [];
    if (!groups.length) e["cloudGroupName"] = "Select at least one cloud group";
    // regions: must include global and at least 1
    const regions = values.regionList ?? [];
    if (!regions.length) e["regionList"] = "Select at least one region";
    if (!regions.includes("global"))
      e["regionList"] = "Region list must include 'global'";
    // credentials
    const creds: any = values.credentials || {};
    if (!creds.accessKeyId)
      e["credentials.accessKeyId"] = "Access Key is required";
    if (!creds.secretAccessKey)
      e["credentials.secretAccessKey"] = "Secret Key is required";
    // eventSource
    const eventSource: any = values.eventSource || {};
    if (
      !eventSource.cloudTrailName ||
      !String(eventSource.cloudTrailName).trim()
    ) {
      e["eventSource.cloudTrailName"] = "CloudTrail Name is required";
    }
    // schedule
    if (values.scheduleScanEnabled) {
      const s: any = values.scheduleScanSetting || {};
      const freq = s.frequency || "DAY";
      if (s.minute == null || s.minute === "")
        e["schedule.minute"] = "Minute is required";
      if (freq !== "HOUR" && (s.hour == null || s.hour === ""))
        e["schedule.hour"] = "Hour is required";
      if (freq === "WEEK" && !s.weekday)
        e["schedule.weekday"] = "Weekday is required";
      if (freq === "MONTH" && !s.date) e["schedule.date"] = "Date is required";
    }
    return e;
  }

  function onSubmit() {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const payload = { ...(form as Cloud) };
    if (isEdit && cloudId) payload.id = cloudId;
    // 실제 환경이라면 API 요청 수행
    // eslint-disable-next-line no-console
    console.log("Submit Cloud Payload:", payload);
    onOpenChange(false);
    onSubmitted(payload);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="flex flex-col max-h-[80vh] my-8">
        <DialogHeader>{isEdit ? "Edit Cloud" : "Create Cloud"}</DialogHeader>
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading...</div>
        ) : (
          <CloudFormFields form={form} onChange={update} errors={errors} />
        )}
        <DialogFooter>
          <Button
            className="bg-secondary text-black"
            onClick={() => onOpenChange(false)}
          >
            취소
          </Button>
          <Button onClick={onSubmit}>확인</Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
