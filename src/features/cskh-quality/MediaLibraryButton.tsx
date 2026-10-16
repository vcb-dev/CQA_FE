import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Images, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createMediaFolder,
  deleteMediaAsset,
  deleteMediaFolder,
  fetchMediaAssets,
  fetchMediaFolders,
  uploadMediaAssets,
  type MediaAsset,
  type MediaFolder,
} from "./api";

const mediaLibraryKey = ["cskh", "media-library"] as const;

interface MediaLibraryButtonProps {
  disabled?: boolean;
  onPick: (files: File[]) => void;
}

function apiMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })
    ?.response?.data?.message;
  return typeof message === "string" && message ? message : fallback;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaLibraryButton({
  disabled,
  onPick,
}: MediaLibraryButtonProps) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [folderId, setFolderId] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [folderName, setFolderName] = useState("");
  const [naming, setNaming] = useState(false);
  const [picking, setPicking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const foldersQuery = useQuery({
    queryKey: [...mediaLibraryKey, "folders"],
    queryFn: fetchMediaFolders,
    enabled: open,
  });
  const assetsQuery = useQuery({
    queryKey: [...mediaLibraryKey, "assets"],
    queryFn: () => fetchMediaAssets(),
    enabled: open,
  });

  const folders: MediaFolder[] = foldersQuery.data ?? [];
  const assets: MediaAsset[] = assetsQuery.data ?? [];
  const loading = foldersQuery.isLoading || assetsQuery.isLoading;

  const invalidate = () => qc.invalidateQueries({ queryKey: mediaLibraryKey });

  const createFolderMut = useMutation({
    mutationFn: createMediaFolder,
    onSuccess: async (created) => {
      setFolderId(created.id);
      setFolderName("");
      setNaming(false);
      await invalidate();
    },
    onError: (error: unknown) => {
      toast.error(apiMessage(error, "Không tạo được thư mục"));
    },
  });

  const deleteFolderMut = useMutation({
    mutationFn: deleteMediaFolder,
    onSuccess: async (_data, id) => {
      setAssetsSelectionAfterFolderDelete(id);
      await invalidate();
    },
    onError: (error: unknown) => {
      toast.error(apiMessage(error, "Không xóa được thư mục"));
    },
  });

  const uploadMut = useMutation({
    mutationFn: ({
      folderId: id,
      files,
    }: {
      folderId: string;
      files: File[];
    }) => uploadMediaAssets(id, files),
    onSuccess: () => invalidate(),
    onError: (error: unknown) => {
      toast.error(apiMessage(error, "Không tải ảnh lên được"));
    },
  });

  const deleteAssetMut = useMutation({
    mutationFn: deleteMediaAsset,
    onSuccess: async (_data, assetId) => {
      setSelected((current) => current.filter((id) => id !== assetId));
      await invalidate();
    },
    onError: (error: unknown) => {
      toast.error(apiMessage(error, "Không xóa được ảnh"));
    },
  });

  const busy =
    picking ||
    createFolderMut.isPending ||
    deleteFolderMut.isPending ||
    uploadMut.isPending ||
    deleteAssetMut.isPending;

  function setAssetsSelectionAfterFolderDelete(id: string) {
    if (folderId === id) setFolderId("");
    setSelected([]);
  }

  const q = query.trim().toLowerCase();
  const visibleFolders = useMemo(
    () =>
      folders.filter((folder) => !q || folder.name.toLowerCase().includes(q)),
    [folders, q],
  );
  const visibleAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (folderId && asset.folderId !== folderId) return false;
      if (!q) return true;
      return asset.name.toLowerCase().includes(q);
    });
  }, [assets, folderId, q]);

  const usedBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);

  function close() {
    setOpen(false);
    setMenuOpen(false);
    setSelected([]);
    setQuery("");
    setFolderId("");
    setNaming(false);
    setFolderName("");
  }

  function toggleAsset(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function addFolder() {
    const name = folderName.trim();
    if (!name || busy) return;
    createFolderMut.mutate(name);
  }

  function removeFolder(id: string) {
    if (!window.confirm("Xóa thư mục và toàn bộ ảnh bên trong?")) return;
    deleteFolderMut.mutate(id);
  }

  function onUpload(list: FileList | null) {
    if (!list?.length || busy) return;
    if (!folderId) {
      toast.error("Chọn một thư mục trước khi tải ảnh");
      return;
    }
    uploadMut.mutate({ folderId, files: Array.from(list) });
  }

  function removeAsset(assetId: string) {
    deleteAssetMut.mutate(assetId);
  }

  async function insertSelected() {
    const chosen = visibleAssets.filter((asset) => selected.includes(asset.id));
    if (!chosen.length || busy) return;
    setPicking(true);
    try {
      const files: File[] = [];
      for (const asset of chosen) {
        const res = await fetch(asset.url);
        if (!res.ok) throw new Error("fetch failed");
        const blob = await res.blob();
        files.push(
          new File([blob], asset.name, { type: asset.mimeType || blob.type }),
        );
      }
      onPick(files);
      close();
    } catch {
      toast.error("Không lấy được ảnh để gửi");
    } finally {
      setPicking(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        aria-label="Kho ảnh"
        title="Thư viện ảnh"
        onClick={() => setOpen(true)}
      >
        <Images />
      </Button>

      {open && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="flex h-[min(760px,92vh)] w-[min(1080px,96vw)] overflow-hidden rounded-xl bg-white shadow-2xl">
            <aside className="flex w-[230px] shrink-0 flex-col border-r border-slate-200 bg-slate-50">
              <div className="px-4 py-4 text-[18px] font-semibold text-slate-800">
                Thư viện
              </div>
              <div className="relative px-3">
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-[13px] font-semibold text-white"
                >
                  <Plus className="h-4 w-4" />
                  Thêm mới
                </button>
                {menuOpen && (
                  <div className="absolute left-3 right-3 top-11 z-10 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false);
                        fileRef.current?.click();
                      }}
                    >
                      Tải ảnh lên
                    </button>
                    <button
                      type="button"
                      className="block w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50"
                      onClick={() => {
                        setMenuOpen(false);
                        setNaming(true);
                      }}
                    >
                      Tạo thư mục
                    </button>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    void onUpload(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setFolderId("")}
                className={`mx-3 mt-4 rounded-lg px-3 py-2 text-left text-[13px] ${
                  folderId
                    ? "text-slate-600 hover:bg-white"
                    : "bg-white font-medium text-blue-700 shadow-sm"
                }`}
              >
                Tệp đã tải lên
              </button>
              <div className="mt-auto px-4 py-4">
                <div className="mb-1 text-[12px] text-slate-700 font-semibold underline">
                  Đã dùng {formatBytes(usedBytes)}
                </div>
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <div className="flex flex-1 items-center gap-2 rounded-full border border-slate-200 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm hình ảnh và thư mục"
                    className="w-full bg-transparent text-[13px] outline-none"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  onClick={close}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                {loading ? (
                  <div className="flex items-center gap-2 py-10 text-[13px] text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải…
                  </div>
                ) : (
                  <>
                    <div className="mb-2 text-[13px] font-semibold text-slate-700">
                      Thư mục
                    </div>
                    {naming && (
                      <div className="mb-3 flex gap-2">
                        <input
                          value={folderName}
                          onChange={(e) => setFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void addFolder();
                          }}
                          placeholder="Tên thư mục"
                          className="w-56 rounded-md border border-slate-200 px-2 py-1.5 text-[13px]"
                        />
                        <button
                          type="button"
                          disabled={busy || !folderName.trim()}
                          onClick={() => void addFolder()}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-[13px] text-white disabled:opacity-50"
                        >
                          Tạo
                        </button>
                      </div>
                    )}
                    <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                      {visibleFolders.map((folder) => (
                        <div
                          key={folder.id}
                          className="flex items-center gap-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setFolderId(
                                folder.id === folderId ? "" : folder.id,
                              )
                            }
                            className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] ${
                              folder.id === folderId
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
                                folder.id === folderId
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-slate-300"
                              }`}
                            />
                            <span className="truncate">{folder.name}</span>
                          </button>
                          <button
                            type="button"
                            aria-label={`Xóa ${folder.name}`}
                            onClick={() => void removeFolder(folder.id)}
                            className="text-slate-300 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-slate-700">
                        Ảnh
                      </div>
                      <button
                        type="button"
                        className="text-[13px] text-blue-600"
                        onClick={() =>
                          setSelected(
                            selected.length === visibleAssets.length
                              ? []
                              : visibleAssets.map((asset) => asset.id),
                          )
                        }
                      >
                        Chọn tất cả
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
                      {visibleAssets.map((asset) => {
                        const active = selected.includes(asset.id);
                        return (
                          <div key={asset.id} className="group relative">
                            <button
                              type="button"
                              onClick={() => toggleAsset(asset.id)}
                              className="w-full text-left"
                            >
                              <span
                                className={`relative block aspect-square overflow-hidden rounded-md border-2 ${
                                  active
                                    ? "border-blue-500 border-4"
                                    : "border-transparent"
                                }`}
                              >
                                <img
                                  src={asset.thumbUrl}
                                  alt={asset.name}
                                  className="h-full w-full object-cover"
                                />
                              </span>
                              <span
                                title={asset.name}
                                className="mt-1 line-clamp-2 break-words text-center text-[12px] text-slate-600"
                              >
                                {asset.name.replace(/\.[^.]+$/, "")}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-label="Xóa ảnh"
                              onClick={() => void removeAsset(asset.id)}
                              className="absolute right-1 top-1 hidden rounded-full bg-slate-900/70 p-1 text-white group-hover:block"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {!visibleAssets.length && (
                      <p className="py-8 text-center text-[13px] text-slate-400">
                        Chưa có ảnh.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={busy || selected.length === 0}
                  onClick={() => void insertSelected()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {busy ? "Đang gắn…" : "Chèn tệp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
