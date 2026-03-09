package com.october.shop.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class SchemaMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaMigrationRunner.class);
    private final JdbcTemplate jdbcTemplate;

    public SchemaMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        dropLegacyProductImageUniqueConstraint();
        dropLegacyProductImageUniqueIndexes();
        dropSingleColumnUniqueOnProductId();
        migrateUserPhoneAndNicknameSchema();
    }

    private void dropLegacyProductImageUniqueConstraint() {
        try {
            List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
                    """
                    SELECT cls.relname AS table_name, con.conname AS constraint_name
                    FROM pg_constraint con
                    JOIN pg_class cls ON cls.oid = con.conrelid
                    JOIN pg_namespace nsp ON nsp.oid = con.connamespace
                    WHERE nsp.nspname = 'public'
                      AND con.contype = 'u'
                      AND con.conname = 'uk_product_images'
                      AND cls.relname IN ('product_images', 'products_images')
                    """
            );

            for (Map<String, Object> row : constraints) {
                String tableName = String.valueOf(row.get("table_name"));
                String constraintName = String.valueOf(row.get("constraint_name"));
                jdbcTemplate.execute(
                        "ALTER TABLE \"" + tableName + "\" DROP CONSTRAINT IF EXISTS \"" + constraintName + "\""
                );
                log.info("Dropped legacy unique constraint {} on table {}", constraintName, tableName);
            }
        } catch (Exception e) {
            log.warn("Failed to drop legacy uk_product_images constraint automatically", e);
        }
    }

    private void dropLegacyProductImageUniqueIndexes() {
        try {
            List<Map<String, Object>> indexes = jdbcTemplate.queryForList(
                    """
                    SELECT schemaname, indexname
                    FROM pg_indexes
                    WHERE schemaname = 'public'
                      AND indexname = 'uk_product_images'
                    """
            );

            for (Map<String, Object> row : indexes) {
                String schemaName = String.valueOf(row.get("schemaname"));
                String indexName = String.valueOf(row.get("indexname"));
                jdbcTemplate.execute(
                        "DROP INDEX IF EXISTS \"" + schemaName + "\".\"" + indexName + "\""
                );
                log.info("Dropped legacy unique index {}.{}", schemaName, indexName);
            }
        } catch (Exception e) {
            log.warn("Failed to drop legacy uk_product_images unique index automatically", e);
        }
    }

    private void dropSingleColumnUniqueOnProductId() {
        try {
            List<Map<String, Object>> constraints = jdbcTemplate.queryForList(
                    """
                    SELECT cls.relname AS table_name, con.conname AS constraint_name
                    FROM pg_constraint con
                    JOIN pg_class cls ON cls.oid = con.conrelid
                    JOIN pg_namespace nsp ON nsp.oid = con.connamespace
                    WHERE nsp.nspname = 'public'
                      AND con.contype = 'u'
                      AND cls.relname IN ('product_images', 'products_images')
                      AND array_length(con.conkey, 1) = 1
                      AND (
                        SELECT att.attname
                        FROM pg_attribute att
                        WHERE att.attrelid = con.conrelid
                          AND att.attnum = con.conkey[1]
                      ) = 'product_id'
                    """
            );

            for (Map<String, Object> row : constraints) {
                String tableName = String.valueOf(row.get("table_name"));
                String constraintName = String.valueOf(row.get("constraint_name"));
                jdbcTemplate.execute(
                        "ALTER TABLE \"" + tableName + "\" DROP CONSTRAINT IF EXISTS \"" + constraintName + "\""
                );
                log.info("Dropped unique(product_id) constraint {} on table {}", constraintName, tableName);
            }
        } catch (Exception e) {
            log.warn("Failed to drop unique(product_id) constraint on product image table automatically", e);
        }
    }

    private void migrateUserPhoneAndNicknameSchema() {
        try {
            jdbcTemplate.execute(
                    """
                    ALTER TABLE users
                    DROP COLUMN IF EXISTS nickname
                    """
            );
            log.info("Dropped users.nickname column if it existed");

            jdbcTemplate.execute(
                    """
                    ALTER TABLE users
                    ALTER COLUMN phone_number SET NOT NULL
                    """
            );
            log.info("Set users.phone_number to NOT NULL");
        } catch (Exception e) {
            log.warn("Failed to migrate users schema for phone_number/nickname automatically", e);
        }
    }
}
