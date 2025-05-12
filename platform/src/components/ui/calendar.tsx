"use client"

import * as React from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DatePicker>

function Calendar({
  className,
  classNames,
  ...props
}: CalendarProps) {
  return (
    <DatePicker
      className={cn("p-3", className)}
      // The following props are examples and may need adjustment based on react-datepicker's API
      // and the specific requirements of your application.
      // You'll need to map the props from the old DayPicker to the new DatePicker.
      // For example, DayPicker's `mode` and `selected` might map to `selected` and `onChange` in react-datepicker.
      // Please refer to the react-datepicker documentation for available props.
      // selected={props.selected} // Example: if you had a selected prop
      // onChange={props.onChange} // Example: if you had an onChange prop
      // showOutsideDays={props.showOutsideDays} // This prop might not exist or have a different name
      {...props} // Pass through other props, but ensure they are valid for DatePicker
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

