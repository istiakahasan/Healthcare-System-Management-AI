import { z } from "zod";

export const MonthEnum = z.enum([
  "JANUARY",
  "FEBRUARY", 
  "MARCH", 
  "APRIL", 
  "MAY", 
  "JUNE", 
  "JULY", 
  "AUGUST", 
  "SEPTEMBER",
  "OCTOBER", 
  "NOVEMBER", 
  "DECEMBER" 
]);
