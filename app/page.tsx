"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import CloudDialog from "@/components/CloudDialog";
import { Cloud } from "@/types";
import { listClouds } from "@/lib/mockApi";
import { EditIcon, TrashIcon } from "@/components/common";

export default function Page() {
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setClouds(listClouds());
  }, []);

  const editingCloud = useMemo(
    () => clouds.find((c) => c.id === editingId),
    [clouds, editingId]
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cloud Management</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setDialogOpen(true);
          }}
        >
          + Create Cloud
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary">
            <tr>
              <th className="p-3">Provider</th>
              <th className="p-3">Name</th>
              <th className="p-3">Cloud Group</th>
              <th className="p-3">Regions</th>
              <th className="p-3 w-20">Edit</th>
              <th className="p-3 w-20">Delete</th>
            </tr>
          </thead>
          <tbody>
            {clouds.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.provider}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.cloudGroupName?.join(", ")}</td>
                <td className="p-3">{c.regionList.join(", ")}</td>
                <td className="p-3">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-gray-50"
                    onClick={() => {
                      setEditingId(c.id);
                      setDialogOpen(true);
                    }}
                    aria-label={`Edit ${c.name}`}
                    title="Edit"
                  >
                    <EditIcon />
                  </button>
                </td>
                <td className="p-3">
                  <button
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-red-600 hover:bg-red-50"
                    onClick={() => {
                      // 간단한 확인 후 로컬 상태에서 삭제
                      const ok = confirm(`Delete cloud \"${c.name}\"?`);
                      if (!ok) return;
                      setClouds((prev) => prev.filter((x) => x.id !== c.id));
                    }}
                    aria-label={`Delete ${c.name}`}
                    title="Delete"
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CloudDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cloudId={editingId}
        initialData={editingCloud}
        onSubmitted={(payload) => {
          // naive in-memory update for demo
          if (payload.id) {
            setClouds((prev) =>
              prev.map((c) =>
                c.id === payload.id ? ({ ...c, ...payload } as Cloud) : c
              )
            );
          } else {
            const id = Math.random().toString(36).slice(2, 8);
            setClouds((prev) => [
              { ...(payload as any), id } as Cloud,
              ...prev,
            ]);
          }
        }}
      />
    </main>
  );
}
