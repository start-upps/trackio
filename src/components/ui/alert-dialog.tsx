// src/components/ui/alert-dialog.tsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { buttonVariants } from "./button"
import { cn } from "@/lib/utils"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogContent = React.forwardRef(function AlertDialogContent(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80" />
      <AlertDialogPrimitive.Content
        ref={ref}
        className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-800 border border-gray-700 p-6 shadow-lg duration-200 w-full max-w-lg"
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  )
})
AlertDialogContent.displayName = "AlertDialogContent"

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2", className)} {...props} />
}
AlertDialogHeader.displayName = "AlertDialogHeader"

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end space-x-2 mt-6", className)} {...props} />
  )
}
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(function AlertDialogTitle(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>,
  ref: React.ForwardedRef<HTMLHeadingElement>
) {
  return (
    <AlertDialogPrimitive.Title
      ref={ref}
      className="text-lg font-semibold"
      {...props}
    />
  )
})
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef(function AlertDialogDescription(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>,
  ref: React.ForwardedRef<HTMLParagraphElement>
) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className="text-sm text-gray-400"
      {...props}
    />
  )
})
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef(function AlertDialogAction(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonVariants())}
      {...props}
    />
  )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef(function AlertDialogCancel(
  props: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonVariants({ variant: "ghost" }))}
      {...props}
    />
  )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}