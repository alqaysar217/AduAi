
"use client"

import { useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage
import { useToast as useToastInternal } from "@/hooks/use-toast" // Renamed to avoid conflict
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToastInternal(); // Using the internal hook
  const { t } = useLanguage(); // Get t function for localization

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, titleKey, descriptionKey, descriptionReplacements, titleReplacements, ...props }) {
        const finalTitle = titleKey ? t(titleKey, titleReplacements) : title;
        const finalDescription = descriptionKey ? t(descriptionKey, descriptionReplacements) : description;
        
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {finalTitle && <ToastTitle>{finalTitle}</ToastTitle>}
              {finalDescription && (
                <ToastDescription>{finalDescription}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
