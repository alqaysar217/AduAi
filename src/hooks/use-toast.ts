
"use client"

import * as React from "react"
import { type Language, useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage for t function

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  titleKey?: string // For localization
  descriptionKey?: string // For localization
  descriptionReplacements?: Record<string, string> // For dynamic values in description
  titleReplacements?: Record<string, string> // For dynamic values in title

}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// Update Toast type to include localization keys
type ToastInput = Omit<ToasterToast, "id" | "title" | "description"> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  titleKey?: string;
  descriptionKey?: string;
  descriptionReplacements?: Record<string, string>;
  titleReplacements?: Record<string, string>;
};


// The global toast function
function toast({ ...props }: ToastInput) {
  const id = genId();

  // Note: We can't use useLanguage() hook directly here as this function is not a React component.
  // The localization must happen within the Toaster component where the hook can be used.
  // So, we pass titleKey and descriptionKey to the ToasterToast object.

  const update = (newProps: Partial<ToasterToast>) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...newProps, id },
    });
  };

  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    } as ToasterToast, // Cast to ensure all props are there
  });

  return {
    id: id,
    dismiss,
    update,
  };
}


function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  const { t } = useLanguage(); // Get t function from context

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  // Return a modified toast function that can use the 't' function from the hook's scope
  const localizedToast = React.useCallback(({ titleKey, descriptionKey, title, description, descriptionReplacements, titleReplacements, ...props }: ToastInput) => {
    const finalTitle = titleKey ? t(titleKey, titleReplacements) : title;
    const finalDescription = descriptionKey ? t(descriptionKey, descriptionReplacements) : description;
    
    return toast({ ...props, title: finalTitle, description: finalDescription });
  }, [t]);


  return {
    ...state,
    toast: localizedToast, // Use the localized version
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast as rawToast }; // Export rawToast if needed elsewhere, prefer useToast().toast
