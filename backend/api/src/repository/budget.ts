import { NotFoundError } from "eada/lib/error";
import { FastifyInstance } from "fastify";

export class BudgetRepository {
  private _app: FastifyInstance;

  constructor(app: FastifyInstance) {
    this._app = app;
  }

  async totalExpenseInMonth(userId: string): Promise<number> {
    const startOfMonth = this._app.dayjs().startOf("month");
    this._app.log.info(`Retrieving total expense in ${startOfMonth.format("MMM, YYYY")}`);
    const transactionInMonthAggregation = await this._app.db.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userId,
        createdAt: {
          gte: startOfMonth.toDate(),
          lt: startOfMonth.add(1, "month").toDate(),
        },
      },
    });

    return transactionInMonthAggregation._sum.amount?.toNumber() ?? 0;
  }

  async totalRemainingBudgetInMonth(userId: string) {
    const startOfMonth = this._app.dayjs().startOf("month");
    this._app.log.info(`Retrieving total remaining budget in ${startOfMonth.format("MMM, YYYY")}`);
    const user = await this._app.db.user.findUnique({
      select: {
        budget: {
          take: 1,
          select: {
            income: true,
          },
        },
        transaction: {
          where: {
            createdAt: {
              gte: startOfMonth.toDate(),
              lt: startOfMonth.add(1, "month").toDate(),
            },
          },
        },
      },
      where: {
        id: userId,
      },
    });

    if (user == null) {
      throw new NotFoundError("User not found");
    }

    if (user.budget.length === 0) {
      throw new NotFoundError("User does not have any budget");
    }

    const totalBudget = user.budget[0].income.toNumber();
    const totalExpenseInMonth =
      user.transaction.reduce((total, { amount }) => total + amount.toNumber(), 0) ?? 0;
    return totalBudget - totalExpenseInMonth;
  }
}
