"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

interface PrivacyPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PrivacyPolicyDialog({ open, onOpenChange }: PrivacyPolicyDialogProps) {
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
                  <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
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
                  <h2 className="font-bold">1. Information We Collect</h2>
                  <p>We collect information you provide directly to us when you use our services. This includes:</p>
                  <ul>
                    <li>Search queries and interactions with our AI system</li>
                    <li>API keys that you provide through the settings interface</li>
                    <li>Usage data and analytics to improve our service</li>
                  </ul>

                  <h2 className="font-bold">2. How We Use Your Information</h2>
                  <p>We use the information we collect to:</p>
                  <ul>
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process and complete transactions</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Respond to your comments and questions</li>
                  </ul>

                  <h2 className="font-bold">3. Data Storage</h2>
                  <p>
                    Your API keys are stored locally in your browser using localStorage and are not transmitted to our
                    servers. Search queries and results may be temporarily processed but are not permanently stored.
                  </p>

                  <h2 className="font-bold">4. Third-Party Services</h2>
                  <p>
                    Our service integrates with third-party APIs including search engines and AI providers. Your use of
                    these services is subject to their respective privacy policies.
                  </p>

                  <h2 className="font-bold">5. Changes to This Policy</h2>
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting
                    the new privacy policy on this page.
                  </p>

                  <h2 className="font-bold">6. Contact Us</h2>
                  <p>If you have any questions about this privacy policy, please contact us at privacy@example.com.</p>
                </div>
              </ScrollArea>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

