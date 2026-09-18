CREATE SCHEMA IF NOT EXISTS "payrun";

CREATE TABLE "payrun"."handles" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "nimiqAddress" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payrun_handles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payrun_handles_handle_key" ON "payrun"."handles"("handle");

CREATE TABLE "payrun"."roster_entries" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "handleId" TEXT NOT NULL,
    "amountLuna" INTEGER NOT NULL,
    "cadence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrun_roster_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payrun_roster_entries_owner_handle_key" ON "payrun"."roster_entries"("ownerAddress", "handleId");

CREATE TABLE "payrun"."pay_cycles" (
    "id" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "preparedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "payrun_pay_cycles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payrun_pay_cycles_owner_period_idx" ON "payrun"."pay_cycles"("ownerAddress", "periodKey");

CREATE TABLE "payrun"."pay_items" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "handleId" TEXT NOT NULL,
    "amountLuna" INTEGER NOT NULL,
    "previousAmountLuna" INTEGER,
    "flagsJson" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "txHash" TEXT,
    "status" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payrun_pay_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "payrun"."roster_entries" ADD CONSTRAINT "payrun_roster_entries_handleId_fkey" FOREIGN KEY ("handleId") REFERENCES "payrun"."handles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payrun"."pay_items" ADD CONSTRAINT "payrun_pay_items_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "payrun"."pay_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "payrun"."pay_items" ADD CONSTRAINT "payrun_pay_items_handleId_fkey" FOREIGN KEY ("handleId") REFERENCES "payrun"."handles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
