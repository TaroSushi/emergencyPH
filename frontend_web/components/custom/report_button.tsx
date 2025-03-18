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

export function ReportModal() {
    return (
        <Dialog>
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
                    <Button type="submit">Submit Report</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
