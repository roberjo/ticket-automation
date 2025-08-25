/**
 * Toast Notification Hook
 * 
 * This custom React hook provides a comprehensive toast notification system
 * with state management, automatic dismissal, and queue management. It uses
 * a reducer pattern to manage toast state and provides a clean API for
 * creating, updating, and dismissing toast notifications.
 * 
 * Purpose:
 * - Provide toast notification functionality throughout the application
 * - Manage toast state with automatic cleanup
 * - Support toast updates and dismissal
 * - Limit concurrent toasts to prevent UI clutter
 * - Provide a clean API for toast operations
 * 
 * Features:
 * - Toast creation with unique IDs
 * - Toast updates and dismissal
 * - Automatic toast removal after timeout
 * - Toast queue management with limits
 * - Global state management with listeners
 * 
 * Architecture:
 * - Uses reducer pattern for state management
 * - Implements observer pattern with listeners
 * - Provides both hook and direct function access
 * - Manages toast timeouts and cleanup
 */

import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

// Maximum number of toasts that can be displayed simultaneously
const TOAST_LIMIT = 1

// Delay in milliseconds before automatically removing dismissed toasts
const TOAST_REMOVE_DELAY = 1000000

/**
 * Toaster Toast Type
 * 
 * Extended toast type that includes additional properties for
 * the toast notification system.
 */
type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * Action Types
 * 
 * Defines the available actions for the toast reducer.
 * These actions control the toast state management.
 */
const actionTypes = {
  ADD_TOAST: "ADD_TOAST",           // Add a new toast to the queue
  UPDATE_TOAST: "UPDATE_TOAST",     // Update an existing toast
  DISMISS_TOAST: "DISMISS_TOAST",   // Dismiss a toast (mark as closed)
  REMOVE_TOAST: "REMOVE_TOAST",     // Remove a toast from the queue
} as const

// Counter for generating unique toast IDs
let count = 0

/**
 * Generate Unique ID
 * 
 * Generates a unique string ID for toast notifications.
 * Uses a counter that wraps around to prevent overflow.
 * 
 * @returns string - Unique toast ID
 */
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

/**
 * Action Union Type
 * 
 * Defines all possible actions that can be dispatched to the reducer.
 * Each action has a specific type and associated data.
 */
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

/**
 * State Interface
 * 
 * Defines the structure of the toast state.
 */
interface State {
  toasts: ToasterToast[]
}

// Map to track toast removal timeouts
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

/**
 * Add To Remove Queue
 * 
 * Schedules a toast for removal after the specified delay.
 * Prevents duplicate timeouts for the same toast.
 * 
 * @param toastId - ID of the toast to schedule for removal
 * 
 * Expected Result:
 * - Toast is scheduled for removal after TOAST_REMOVE_DELAY
 * - No duplicate timeouts are created for the same toast
 */
const addToRemoveQueue = (toastId: string) => {
  // Prevent duplicate timeouts for the same toast
  if (toastTimeouts.has(toastId)) {
    return
  }

  // Create timeout to remove the toast
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  // Store the timeout reference
  toastTimeouts.set(toastId, timeout)
}

/**
 * Toast Reducer
 * 
 * Manages toast state based on dispatched actions.
 * Handles adding, updating, dismissing, and removing toasts.
 * 
 * @param state - Current toast state
 * @param action - Action to perform
 * @returns State - Updated toast state
 * 
 * Action Handlers:
 * - ADD_TOAST: Adds new toast to the beginning of the queue
 * - UPDATE_TOAST: Updates existing toast with new properties
 * - DISMISS_TOAST: Marks toast as closed and schedules removal
 * - REMOVE_TOAST: Removes toast from the queue
 */
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      // Add new toast to the beginning and limit queue size
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      // Update existing toast with new properties
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // Schedule toasts for removal (side effect)
      if (toastId) {
        // Dismiss specific toast
        addToRemoveQueue(toastId)
      } else {
        // Dismiss all toasts
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      // Mark toasts as closed
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
        // Remove all toasts
        return {
          ...state,
          toasts: [],
        }
      }
      // Remove specific toast
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Array of state change listeners
const listeners: Array<(state: State) => void> = []

// In-memory state storage
let memoryState: State = { toasts: [] }

/**
 * Dispatch Function
 * 
 * Dispatches actions to the reducer and notifies all listeners
 * of state changes.
 * 
 * @param action - Action to dispatch
 * 
 * Expected Result:
 * - State is updated via reducer
 * - All listeners are notified of state change
 */
function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

/**
 * Toast Function
 * 
 * Creates a new toast notification and returns functions for
 * updating and dismissing the toast.
 * 
 * @param props - Toast properties (excluding id)
 * @returns Object with toast ID, dismiss, and update functions
 * 
 * Expected Result:
 * - New toast is added to the queue
 * - Toast is marked as open
 * - Returns functions for toast management
 */
function toast({ ...props }: Toast) {
  const id = genId()

  // Function to update the toast
  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  
  // Function to dismiss the toast
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  // Add the toast to the queue
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

/**
 * useToast Hook
 * 
 * React hook that provides access to the toast state and functions.
 * Subscribes to state changes and provides toast management capabilities.
 * 
 * @returns Object with toast state and management functions
 * 
 * Expected Result:
 * - Current toast state
 * - Toast creation function
 * - Toast dismissal function
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    // Subscribe to state changes
    listeners.push(setState)
    
    // Cleanup subscription on unmount
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
