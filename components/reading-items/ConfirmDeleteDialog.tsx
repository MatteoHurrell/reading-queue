'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  itemTitle: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteDialog({
  open,
  itemTitle,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel() }}>
      <DialogContent className="sm:max-w-sm bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Delete item?</DialogTitle>
          <DialogDescription className="text-gray-500">
            This will permanently remove{' '}
            <span className="text-gray-700 font-medium">&ldquo;{itemTitle}&rdquo;</span>{' '}
            from your reading queue. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
