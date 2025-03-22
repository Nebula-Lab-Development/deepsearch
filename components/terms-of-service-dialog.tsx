"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface TermsOfServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsOfServiceDialog({ open, onOpenChange }: TermsOfServiceDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-800">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
                  <DialogDescription className="text-muted-foreground">Last updated: March 2025</DialogDescription>
                </DialogHeader>
                <button
                  onClick={() => onOpenChange(false)}
                  className="rounded-full p-1 hover:bg-muted transition-colors"
                >
                  {/* <X className="h-4 w-4" /> */}
                </button>
              </div>

              <ScrollArea className="h-[60vh] p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className="font-bold">1. Acceptance of Terms</h2>
                  <p>
                    By accessing or using our Deepsearch service, you agree to be bound by these Terms of Service
                    and all applicable laws and regulations. If you do not agree with any of these terms, you are
                    prohibited from using this service.
                  </p>

                  <h2 className="font-bold">2. Use License</h2>
                  <p>
                    Permission is granted to temporarily use this service for personal, non-commercial purposes only.
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul>
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose</li>
                    <li>Attempt to decompile or reverse engineer any software contained in the service</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                  </ul>

                  <h2 className="font-bold">3. Disclaimer</h2>
                  <p>
                    The materials on our service are provided on an 'as is' basis. We make no warranties, expressed or
                    implied, and hereby disclaim and negate all other warranties including, without limitation, implied
                    warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
                    of intellectual property or other violation of rights.
                  </p>

                  <h2 className="font-bold">4. Limitations</h2>
                  <p>
                    In no event shall we or our suppliers be liable for any damages (including, without limitation,
                    damages for loss of data or profit, or due to business interruption) arising out of the use or
                    inability to use the materials on our service, even if we or an authorized representative has been
                    notified orally or in writing of the possibility of such damage.
                  </p>

                  <h2 className="font-bold">5. Accuracy of Materials</h2>
                  <p>
                    The materials appearing on our service could include technical, typographical, or photographic
                    errors. We do not warrant that any of the materials on our service are accurate, complete or
                    current. We may make changes to the materials contained on our service at any time without notice.
                  </p>

                  <h2 className="font-bold">6. Links</h2>
                  <p>
                    We have not reviewed all of the sites linked to our service and are not responsible for the contents
                    of any such linked site. The inclusion of any link does not imply endorsement by us of the site. Use
                    of any such linked website is at the user's own risk.
                  </p>

                  <h2 className="font-bold">7. Modifications</h2>
                  <p>
                    We may revise these terms of service for our service at any time without notice. By using this
                    service you are agreeing to be bound by the then current version of these terms of service.
                  </p>

                  <h2 className="font-bold">8. Governing Law</h2>
                  <p>
                    These terms and conditions are governed by and construed in accordance with the laws and you
                    irrevocably submit to the exclusive jurisdiction of the courts in that location.
                  </p>
                </div>
              </ScrollArea>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

