'use client'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Flag} from "lucide-react";
import { useState } from "react";

type ReportModalProps = {
    onSubmit: () => void
}

export function ReportModal({onSubmit}: ReportModalProps) {
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        await onSubmit();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700"
                >
                    <Flag className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Submit Report</DialogTitle>
                    <DialogDescription>
                        Do you want to submit a report?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
