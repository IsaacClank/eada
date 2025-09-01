BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "_migration" (
	"name" TEXT NOT NULL,
	PRIMARY KEY("name")
);

CREATE TABLE IF NOT EXISTS "budget" (
	"id"                    TEXT      NOT NULL,
	"expected_income"       REAL      NOT NULL,
	"expected_expense"	    REAL      NOT NULL,
	"expected_utilization"	REAL      NOT NULL,
	"expected_surplus"	    REAL      NOT NULL,
	"period_start"	        INTEGER   NOT NULL,
	"period_end"	          INTEGER   NOT NULL,

	PRIMARY KEY("id")
);

CREATE TABLE IF NOT EXISTS "transaction_category" (
	"id"	      TEXT  NOT NULL,
	"budget_id"	TEXT  NOT NULL,
	"name"	    TEXT  NOT NULL,
	"type"	    TEXT  NOT NULL,
	"rate"	    REAL  NOT NULL,

	UNIQUE("budget_id","name"),
	PRIMARY KEY("id"),
	FOREIGN KEY("budget_id") REFERENCES "budget"("id")
);

CREATE TABLE IF NOT EXISTS "transaction" (
	"id"	          TEXT      NOT NULL,
	"timestamp"	    INTEGER   NOT NULL,
	"category_id"	  TEXT      NOT NULL,
	"amount"	      REAL      NOT NULL,
	"note"	        TEXT      NOT NULL,

	PRIMARY KEY("id"),
	FOREIGN KEY("category_id") REFERENCES "transaction_category"("id")
);

INSERT OR IGNORE INTO "_migration" VALUES ('1756645609-initial-migration');
COMMIT;
