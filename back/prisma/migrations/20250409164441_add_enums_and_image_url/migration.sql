/*
  Warnings:

  - The `status` column on the `ShoppingList` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ShoppingListItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `ShoppingListItem` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `unit` on the `ShoppingListItem` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ShoppingListItemStatus" AS ENUM ('pending', 'bought', 'cancelled');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('g', 'kg', 'L', 'mL', 'piece', 'pack', 'bottle', 'box', 'bag', 'can', 'jar', 'bunch', 'head', 'clove', 'leaf', 'slice', 'cup', 'tablespoon', 'teaspoon', 'pinch', 'dash');

-- AlterTable
ALTER TABLE "ShoppingList" DROP COLUMN "status",
ADD COLUMN     "status" "ShoppingListStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "unit",
ADD COLUMN     "unit" "Unit" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ShoppingListItemStatus" NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "ShoppingListItem_ingredientName_idx" ON "ShoppingListItem"("ingredientName");

-- CreateIndex
CREATE INDEX "ShoppingListItem_shoppingListId_ingredientName_idx" ON "ShoppingListItem"("shoppingListId", "ingredientName");
