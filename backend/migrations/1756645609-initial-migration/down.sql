BEGIN TRANSACTION;
DROP TABLE IF EXISTS "transaction";
DROP TABLE IF EXISTS "transaction_category";
DROP TABLE IF EXISTS "budget";
DROP TABLE IF EXISTS "_migration";
DELETE FROM "_migration" WHERE name = '1756645609-initial-migration';
COMMIT;
