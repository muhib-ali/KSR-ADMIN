-- Cleanup dashboard permissions: keep only 'getAll', remove others like 'getOverview'
-- Run this script directly in your database (PostgreSQL)

-- 1) Find dashboard module ID
DO $$
DECLARE
    dashboard_module_id UUID;
BEGIN
    SELECT id INTO dashboard_module_id FROM modules WHERE slug = 'dashboard';
    
    IF dashboard_module_id IS NULL THEN
        RAISE NOTICE 'Dashboard module not found';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Dashboard module ID: %', dashboard_module_id;
    
    -- 2) Delete all dashboard permissions except 'getAll'
    DELETE FROM role_permissions 
    WHERE permission_id IN (
        SELECT id FROM permissions 
        WHERE module_id = dashboard_module_id 
        AND slug != 'getAll'
    );
    
    RAISE NOTICE 'Deleted role-permission links for non-getAll dashboard permissions';
    
    -- 3) Delete the permission records themselves (except getAll)
    DELETE FROM permissions 
    WHERE module_id = dashboard_module_id 
    AND slug != 'getAll';
    
    RAISE NOTICE 'Deleted non-getAll dashboard permissions';
    
    -- 4) Verify what remains
    RAISE NOTICE 'Remaining dashboard permissions:';
    FOR rec IN 
        SELECT slug, title, created_at FROM permissions 
        WHERE module_id = dashboard_module_id 
        ORDER BY slug
    LOOP
        RAISE NOTICE '  - % (%)', rec.slug, rec.title;
    END LOOP;
    
END $$;

-- 5) Show final dashboard permissions
SELECT 
    p.slug, 
    p.title, 
    p.description,
    COUNT(rp.role_id) as role_count
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id
WHERE p.module_id = (SELECT id FROM modules WHERE slug = 'dashboard')
GROUP BY p.id, p.slug, p.title, p.description
ORDER BY p.slug;
