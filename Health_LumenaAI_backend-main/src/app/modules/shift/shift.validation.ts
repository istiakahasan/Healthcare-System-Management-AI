import z from "zod";

export const declineShiftRequestSchema = z.object({
    declineReason: z.string().nonempty("Decline reason in required!")
});
export const shiftValidationSchema = z.object({
    carePlanId: z.string().nonempty("CarePlanId is required!"),
    staffId: z.string().nonempty("StaffId is required!"),
})