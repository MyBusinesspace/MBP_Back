/*
  Warnings:

  - Added the required column `task_detail_id` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `task_detail_title` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "instructions_completed" BOOLEAN[] DEFAULT ARRAY[]::BOOLEAN[],
ADD COLUMN     "schedule_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "task_detail_id" UUID NOT NULL,
ADD COLUMN     "task_detail_title" TEXT NOT NULL,
ALTER COLUMN "scheduled_date" DROP NOT NULL;

-- CreateTable
CREATE TABLE "task_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "working_order_id" UUID NOT NULL,
    "category_id" UUID,
    "category_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_task_details_company_id" ON "task_details"("company_id");

-- CreateIndex
CREATE INDEX "idx_task_details_working_order_id" ON "task_details"("working_order_id");

-- CreateIndex
CREATE INDEX "idx_tasks_task_detail_id" ON "tasks"("task_detail_id");

-- AddForeignKey
ALTER TABLE "task_details" ADD CONSTRAINT "task_details_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_details" ADD CONSTRAINT "task_details_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_details" ADD CONSTRAINT "task_details_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_details" ADD CONSTRAINT "task_details_working_order_id_fkey" FOREIGN KEY ("working_order_id") REFERENCES "working_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_details" ADD CONSTRAINT "task_details_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "task_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_task_detail_id_fkey" FOREIGN KEY ("task_detail_id") REFERENCES "task_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;
