import { Type } from "@fastify/type-provider-typebox";
import * as eada from "eada-types";

export const TransactionType = Type.Enum(eada.TransactionType);
