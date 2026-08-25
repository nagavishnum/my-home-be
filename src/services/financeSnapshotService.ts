import financebook from "../models/financebook";
import FinanceSnapshot from "../models/FinanceSnapshot";

export const getCurrentPeriod = (): number => {
  const now = new Date();

  return (
    now.getFullYear() * 100 +
    (now.getMonth() + 1)
  );
};

export const updateCurrentFinanceSnapshot =
  async (): Promise<void> => {
    const period =
      getCurrentPeriod();

    const financeRecords =
      await financebook
        .find()
        .select('c cv a')
        .lean();

    const categoryTotals =
      new Map<string, number>();

    for (const finance of financeRecords) {
      const categoryId =
        finance.c.toString();

      const value =
        Number(finance.cv) ||
        Number(finance.a) ||
        0;

      const existing =
        categoryTotals.get(
          categoryId,
        ) || 0;

      categoryTotals.set(
        categoryId,
        existing + value,
      );
    }

    const categories =
      Array.from(
        categoryTotals.entries(),
      ).map(
        ([categoryId, value]) => ({
          k: categoryId,
          v: value,
        }),
      );

    await FinanceSnapshot.findOneAndUpdate(
      { p: period },
      {
        p: period,
        c: categories,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
  };

  export const buildFinancePayload = (
  body: any,
) => {
  const {
    n,
    a,
    sv,
    c,
    ty,
    md,
    lp,
    rt,
    cv,
    no,
  } = body;

  const amount =
    Number(a) || 0;

  const sipValue =
    Number(sv) || 0;

  const currentValue =
    Number(cv) || amount;

  return {
    n: String(n).trim(),

    a: amount,

    sv:
      ty === 'Monthly'
        ? sipValue
        : 0,

    c,

    ty,

    md,

    lp: Number(lp) || 0,

    rt: Number(rt) || 0,

    cv: currentValue,

    no: no
      ? String(no).trim()
      : '',
  };
};