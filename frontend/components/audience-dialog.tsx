import { AudienceForm } from "./forms/AudienceForm";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

type CreateAudienceDialogProps = {
    isCreateDialogOpen: boolean,
    setIsCreateDialogOpen: any,
    handleCreateAudience: any,
}

export function CreateAudienceDialog({ isCreateDialogOpen, setIsCreateDialogOpen, handleCreateAudience }: CreateAudienceDialogProps) {
    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Audience</DialogTitle>
                    <DialogDescription>
                        Create a new audience to group your contacts.
                    </DialogDescription>
                </DialogHeader>
                <AudienceForm
                    onSubmit={handleCreateAudience}
                    onCancel={() => setIsCreateDialogOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}

type DeleteAudienceDialogProps = {
    isDeleteDialogOpen: any,
    setIsDeleteDialogOpen: any,
    selectedAudience: any,
    handleDeleteAudience: any
}

export function DeleteAudienceDialog({ isDeleteDialogOpen, setIsDeleteDialogOpen, handleDeleteAudience, selectedAudience }: DeleteAudienceDialogProps) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Audience</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this audience? This action cannot
                        be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => selectedAudience && handleDeleteAudience(Number(selectedAudience.id))}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}