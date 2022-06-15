import type {
  Reservation,
  ReservableDeposit,
  PurchaseUnit,
  Receipt,
  PrismaClient,
} from "@prisma/client";
import { getDB } from "~/lib/db.server";

export type ReservationsResponse = {
  startDate: string;
  endDate: string | null;
  reservableId: string | null;
};

export const getReservations = async (
  ids?: string[]
): Promise<ReservationsResponse[]> => {
  const db = getDB() as PrismaClient;

  const response = (await db.reservation.findMany({
    where: ids
      ? {
          id: {
            in: ids,
          },
        }
      : undefined,
    select: {
      startDate: true,
      endDate: true,
      reservableId: true,
    },
  })) as unknown as ReservationsResponse[];
  return response;
};

export type ReservationResponse =
  | (Reservation & {
      receipt:
        | (Receipt & {
            purchaseUnits: (PurchaseUnit & {
              deposit: ReservableDeposit | null;
            })[];
          })
        | null;
    })
  | null;

export const getReservationsWithDetails = async (
  ids?: string[]
): Promise<ReservationResponse[]> => {
  const db = getDB() as PrismaClient;

  const response = (await db.reservation.findMany({
    where: ids
      ? {
          id: {
            in: ids,
          },
        }
      : undefined,
    include: {
      receipt: {
        include: {
          purchaseUnits: {
            include: {
              deposit: true,
            },
          },
        },
      },
    },
  })) as unknown as ReservationsResponse[];
  return response;
};

export const getReservation = async (
  id: string
): Promise<ReservationResponse> => {
  const db = getDB() as PrismaClient;

  const response = await db.reservation.findUnique({
    where: {
      id,
    },
    include: {
      receipt: {
        include: {
          purchaseUnits: {
            include: {
              deposit: true,
            },
          },
        },
      },
    },
  });
  return response;
};
