"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "./utils";

// Root
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

// Group
function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

// Value
function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

// Trigger (??ÉÅ ??Î∞∞Í≤Ω)
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border",
        "px-3 py-2 text-sm shadow-sm outline-none transition-[color,box-shadow]",
        "focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        "border-input bg-white !bg-white text-foreground", // ????Î∞∞Í≤Ω Í≥†Ï†ï
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      style={{ backgroundColor: "#fff" }} // ??inline Í∞ïÏ†ú
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// Content (??ÉÅ ??Î∞∞Í≤Ω)
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 min-w-[8rem] overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          "bg-white !bg-white text-foreground", // ????Î∞∞Í≤Ω Í≥†Ï†ï
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        style={{ backgroundColor: "#fff" }} // ??inline Í∞ïÏ†ú
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1 bg-white !bg-white", // ??Î∑∞Ìè¨?∏ÎèÑ ?∞ÏÉâ
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
          style={{ backgroundColor: "#fff" }} // ??inline Í∞ïÏ†ú
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// Label
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

// Item (Ï≤¥ÌÅ¨ ?ÑÏù¥ÏΩòÏùÑ ?ºÏ™Ω?ºÎ°ú ?¥Îèô + pl-8Î°?Í≤πÏπ® Î∞©Ï?, ??ÉÅ ??Î∞∞Í≤Ω)
function SelectItem({
  className,
  style,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full select-none items-center gap-2 rounded-sm text-sm outline-hidden",
        // Í∏∞Î≥∏ ?¨Î∞±
        "py-1.5 pr-3 !pl-8 cursor-default",
        // ??ÉÅ ??Î∞∞Í≤Ω
        "bg-white",
        // ?ÅÌò∏?ëÏö© ?ÅÌÉú
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "data-[highlighted]:bg-neutral-100 data-[highlighted]:text-foreground",
        // ?ÑÏù¥ÏΩ?Í≥µÌÜµ
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      // ???∏Î? px/pl ??ñ¥?∞Í∏∞Î•?Î¨¥Î†•??(ÏµúÏö∞??
      style={{ paddingLeft: 32, ...style }}
      {...props}
    >
      {/* ??Ï≤¥ÌÅ¨ ?ÑÏù¥ÏΩ? ?ºÏ™Ω Í≥†Ï†ï, ?çÏä§?∏Ï? Í≤πÏπòÏßÄ ?äÎèÑÎ°?z-index ??∂§ */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 z-0 flex size-4 items-center justify-center" style={{ paddingLeft: "17px" }}q>
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="relative z-10">
        {children}
      </SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}


// Separator
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

// Scroll Buttons (??Î∞∞Í≤Ω)
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1 bg-white !bg-white", className)}
      style={{ backgroundColor: "#fff" }}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1 bg-white !bg-white", className)}
      style={{ backgroundColor: "#fff" }}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
