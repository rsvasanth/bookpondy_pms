"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react"
import { useFrappeFileUpload } from "frappe-react-sdk"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void
    onDelete?: (url: string) => void
    existingImages?: string[]
    maxFiles?: number
    className?: string
}

export function ImageUploader({
    onUploadComplete,
    onDelete,
    existingImages = [],
    maxFiles = 10,
    className
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploadingFiles, setUploadingFiles] = useState<{ name: string; progress: number }[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { upload, loading } = useFrappeFileUpload()

    const handleUpload = useCallback(async (files: FileList | File[]) => {
        const fileList = Array.from(files)

        if (existingImages.length + fileList.length > maxFiles) {
            toast.error(`You can only upload up to ${maxFiles} images`)
            return
        }

        for (const file of fileList) {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`)
                continue
            }

            try {
                setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }])

                // Upload to Frappe
                const result = await upload(file, {
                    isPrivate: false, // Make it public for gallery
                })

                if (result && (result as any).file_url) {
                    onUploadComplete((result as any).file_url)
                }

                setUploadingFiles(prev => prev.filter(f => f.name !== file.name))
            } catch (error: any) {
                console.error("Upload failed:", error)
                toast.error(`Failed to upload ${file.name}: ${error.message || "Unknown error"}`)
                setUploadingFiles(prev => prev.filter(f => f.name !== file.name))
            }
        }
    }, [upload, existingImages, maxFiles, onUploadComplete])

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const onDragLeave = () => {
        setIsDragging(false)
    }

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            handleUpload(e.dataTransfer.files)
        }
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                    "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragging
                        ? "border-[#FF3D2E] bg-red-50/50 scale-[0.98]"
                        : "border-gray-100 hover:border-[#FF3D2E]/50 hover:bg-gray-50/50",
                    loading && "opacity-70 pointer-events-none"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                    multiple
                    accept="image/*"
                    className="hidden"
                />

                <div className="relative mb-4">
                    <div className={cn(
                        "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-500",
                        isDragging ? "bg-[#FF3D2E] text-white rotate-12 scale-110" : "bg-gray-100 text-gray-400"
                    )}>
                        <Upload className={cn("h-8 w-8", isDragging && "animate-bounce")} />
                    </div>
                    {loading && (
                        <div className="absolute -right-2 -bottom-2 h-8 w-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-[#FF3D2E] animate-spin" />
                        </div>
                    )}
                </div>

                <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">
                        {isDragging ? "Drop your images here" : "Drag & drop images or click to browse"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                        Supports JPG, PNG, WEBP (Max {maxFiles} files)
                    </p>
                </div>

                {/* Animated Background Pulse for Dragging */}
                {isDragging && (
                    <div className="absolute inset-0 bg-[#FF3D2E]/5 animate-pulse transition-opacity pointer-events-none" />
                )}
            </div>

            {/* Uploading Progress */}
            {uploadingFiles.length > 0 && (
                <div className="space-y-2">
                    {uploadingFiles.map((file, i) => (
                        <div key={i} className="flex flex-col gap-1.5 p-3 rounded-2xl bg-gray-50/50 border border-gray-100">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <span className="truncate max-w-[200px]">{file.name}</span>
                                <span>Uploading...</span>
                            </div>
                            <Progress value={loading ? 70 : 100} className="h-1.5 bg-gray-100" />
                        </div>
                    ))}
                </div>
            )}

            {/* Image Preview Grid */}
            {existingImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {existingImages.map((url, idx) => (
                        <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all">
                            <img
                                src={url}
                                alt={`Uploaded ${idx}`}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                {onDelete && (
                                    <Button
                                        size="icon"
                                        variant="destructive"
                                        className="h-8 w-8 rounded-xl shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onDelete(url)
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <div className="absolute top-2 left-2">
                                <CheckCircle2 className="h-4 w-4 text-white drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
