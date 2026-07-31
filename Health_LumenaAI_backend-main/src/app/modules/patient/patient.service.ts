import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../lib/prisma";
import QueryBuilder from "../../builder/QueryBuilder";
import { PatientUpdatePayload } from "./patient.interface";

export const PatientService = {
    add: async (userId: string, payload: any) => {
        const {
            isSelfPatient,
            useDifferentAddress,
            address,
            firstName,
            lastName,
            age,
            ...rest
        } = payload;

        // ✅ Check if customer exists in Customer table
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                address: true
            },
        });
        if (!user) {
            throw new ApiError(status.NOT_FOUND, "User Not found!")
        }
        // find customer of the user
        const customer = await prisma.customer.findUnique({
            where: {
                userId
            }
        });

        if (!customer) {
            throw new ApiError(status.NOT_FOUND, "Customer not found!");
        }

        if (useDifferentAddress && !address) {
            throw new ApiError(
                status.BAD_REQUEST,
                "Address is required when useDifferentAddress is true"
            );
        }

        // Determine relation
        const selfCustomerId = isSelfPatient ? customer.id : null;
        const parentCustomerId = isSelfPatient ? null : customer.id;

        // 🧩 Prevent duplicate self patient creation
        if (isSelfPatient) {
            const existingSelfPatient = await prisma.patient.findFirst({
                where: { selfCustomerId: customer.id },
            });

            if (existingSelfPatient) {
                throw new ApiError(
                    status.CONFLICT,
                    "A self patient already exists for this customer."
                );
            }
        }

        // ✅ Create patient
        const patient = await prisma.patient.create({
            data: {
                firstName,
                lastName,
                age,
                ...rest,
                customerId: parentCustomerId,
                selfCustomerId: selfCustomerId,
            },
        });

        // ✅ Create address if needed
        if (useDifferentAddress) {
            const { country, city, state, postcode, latitude, longitude } = address;

            if (!country) {
                throw new ApiError(status.BAD_REQUEST, "Country is required in the address");
            }

            await prisma.address.create({
                data: {
                    country,
                    city,
                    state,
                    postcode,
                    latitude,
                    longitude,
                    patientId: patient.id,
                },
            });
        } else {
            const defaultAddress = Array.isArray(user.address) ? user.address[0] : user.address;

            if (!defaultAddress) {
                throw new ApiError(
                    status.BAD_REQUEST,
                    "No address available for the user to assign to the patient."
                );
            }

            if (!defaultAddress.country) {
                throw new ApiError(status.BAD_REQUEST, "User's default address must have a country");
            }

            await prisma.address.create({
                data: {
                    country: defaultAddress.country,
                    city: defaultAddress.city,
                    state: defaultAddress.state,
                    postcode: defaultAddress.postcode,
                    latitude: defaultAddress.latitude,
                    longitude: defaultAddress.longitude,
                    patientId: patient.id,
                },
            });
        }

        return patient
    },

    //  get all patient
    getAll: async (query: Record<string, unknown>) => {

        const patientQuery = new QueryBuilder(prisma.patient, query)
            .search(["firstName", "lastName"])
            .filter()
            .paginate()
            .select({
                firstName: true,
                lastName: true,
                age: true,
                gender: true,
                notes: true,
                riskFactors: true,
                address: true
            })

        const [result, meta] = await Promise.all([
            patientQuery.execute(),
            patientQuery.countTotal(),
        ]);
        const updatedResult = result.map((patient: any) => ({
            ...patient,
            address: {
                city: patient.address[0]?.city,
                state: patient.address[0]?.state,
                country: patient.address[0]?.country
            }
        }))
        return {
            data: updatedResult,
            meta
        }
    },
    //  get all patient
    getMy: async (query: Record<string, unknown>, userId: string) => {

        const customer = await prisma.customer.findUnique({
            where: {
                userId
            },
            select: {
                id: true
            }
        });
        if (!customer) {
            throw new ApiError(status.NOT_FOUND, "Customer not found!")
        }
        const patientQuery = new QueryBuilder(prisma.patient, query)
            .search(["firstName", "lastName"])
            .filter()
            .rawFilter({ customerId: customer?.id })
            .paginate()
            .select({
                id: true,
                firstName: true,
                lastName: true,
                age: true,
                gender: true,
                notes: true,
                riskFactors: true,
                address: true
            })

        const [result, meta] = await Promise.all([
            patientQuery.execute(),
            patientQuery.countTotal(),
        ]);
        const updatedResult = result.map((patient: any) => ({
            ...patient,
            address: {
                city: patient.address[0]?.city,
                state: patient.address[0]?.state,
                country: patient.address[0]?.country
            }
        }))
        return {
            data: updatedResult,
            meta
        }
    },

    // get patient details
    patientDetails: async (id: string) => {
        const result = await prisma.patient.findUnique({
            where: { id },
            include: {
                customer: {
                    select: {
                        id: true,
                        bio: true,
                        user: { select: { firstName: true, lastName: true, email: true } },
                    },
                },
                carePlans: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        startDate: true,
                    },
                },
                address: {
                    select: {
                        city: true,
                        postcode: true,
                        state: true,
                        country: true,
                    },
                },
            },
        });

        if (!result) {
            throw new ApiError(status.NOT_FOUND, "Patient not found!");
        }

        // unwrap address array into a single object
        return {
            ...result,
            address: result.address?.[0] ?? null,
        };
    },

    //Update Patient
    update: async (id: string, payload: PatientUpdatePayload) => {
        const existingPatient = await prisma.patient.findUnique({
            where: { id },
            include: { address: true }
        });

        if (!existingPatient) {
            throw new ApiError(status.NOT_FOUND, "Patient not found!");
        }


        const result = await prisma.patient.update({
            where: { id },
            data: {
                firstName: payload.firstName ?? existingPatient.firstName,
                lastName: payload.lastName ?? existingPatient.lastName,
                age: payload.age ?? existingPatient.age,
                gender: payload.gender ?? existingPatient.gender,
                notes: payload.notes ?? existingPatient.notes,
                riskFactors: payload.riskFactors ?? existingPatient.riskFactors,
                address: {
                    update: {
                        where: {
                            id: existingPatient.address[0].id, // first and only address
                        },
                        data: {
                            city: payload.city ?? existingPatient.address[0].city,
                            state: payload.state ?? existingPatient.address[0].state,
                            postcode: payload.postcode ?? existingPatient.address[0].postcode,
                            country: payload.country ?? existingPatient.address[0].country,
                        }
                    }
                }
            },
            include: { address: true }
        });

        return {
            ...result,
            ...result.address[0],
            address: undefined

        }
    },
    // delete patient
    delete: async (id: string) => {
        const existingPatient = await prisma.patient.findUnique({ where: { id } });

        if (!existingPatient) {
            throw new ApiError(status.NOT_FOUND, "Patient not found!");
        }

        await prisma.patient.delete({ where: { id } });

        return {
            message: "Patient Deleted Successfully!"
        }
    },
};
